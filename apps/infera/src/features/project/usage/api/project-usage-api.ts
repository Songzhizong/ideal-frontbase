import { z } from "zod"
import type {
  ProjectUsageResult,
  UsageAggregateRow,
  UsageFilterState,
  UsageTrendPoint,
} from "../types"
import { createProjectUsageSeed } from "./project-usage.seed"

interface UsageStore {
  payload: ReturnType<typeof createProjectUsageSeed>
}

const usageStore = new Map<string, UsageStore>()

const UsageFiltersSchema = z.object({
  range: z.enum(["24h", "7d", "30d"]),
  groupBy: z.enum(["service", "revision", "apiKey", "modelVersion", "statusCode"]),
  granularity: z.enum(["hour", "day"]),
  serviceId: z.string(),
  revisionId: z.string(),
  apiKeyId: z.string(),
  modelVersionId: z.string(),
  statusFamily: z.enum(["all", "2xx", "4xx", "5xx"]),
})

const ReadParamsSchema = z.object({
  tenantId: z.string().trim().min(1),
  projectId: z.string().trim().min(1),
})

function getStoreKey(tenantId: string, projectId: string) {
  return `${tenantId}:${projectId}`
}

function ensureUsageStore(tenantId: string, projectId: string) {
  const key = getStoreKey(tenantId, projectId)
  const existing = usageStore.get(key)
  if (existing) {
    return existing
  }

  const payload = createProjectUsageSeed(projectId)
  const nextStore = { payload }
  usageStore.set(key, nextStore)
  return nextStore
}

function hashFactor(value: string) {
  if (value === "all") {
    return 1
  }
  const hash = value.split("").reduce((accumulator, char) => accumulator + char.charCodeAt(0), 0)
  return 0.78 + (hash % 40) / 100
}

function pickRangePoints(points: UsageTrendPoint[], filters: UsageFilterState) {
  const rangeSize =
    filters.range === "24h"
      ? filters.granularity === "hour"
        ? 24
        : 2
      : filters.range === "7d"
        ? filters.granularity === "hour"
          ? 24 * 7
          : 7
        : filters.granularity === "hour"
          ? 24 * 30
          : 30

  if (points.length <= rangeSize) {
    return points
  }

  return points.slice(-rangeSize)
}

function applyStatusFamily(point: UsageTrendPoint, statusFamily: UsageFilterState["statusFamily"]) {
  if (statusFamily === "all") {
    return point
  }

  const selectedRequests =
    statusFamily === "2xx"
      ? point.status2xx
      : statusFamily === "4xx"
        ? point.status4xx
        : point.status5xx

  const ratio = selectedRequests / Math.max(point.requests, 1)

  return {
    ...point,
    requests: selectedRequests,
    promptTokens: Math.round(point.promptTokens * ratio),
    completionTokens: Math.round(point.completionTokens * ratio),
    totalTokens: Math.round(point.totalTokens * ratio),
    estimatedCostCny: Number((point.estimatedCostCny * ratio).toFixed(4)),
    status2xx: statusFamily === "2xx" ? selectedRequests : 0,
    status4xx: statusFamily === "4xx" ? selectedRequests : 0,
    status5xx: statusFamily === "5xx" ? selectedRequests : 0,
  }
}

function applyDimensionFactor(point: UsageTrendPoint, factor: number): UsageTrendPoint {
  return {
    ...point,
    requests: Math.round(point.requests * factor),
    promptTokens: Math.round(point.promptTokens * factor),
    completionTokens: Math.round(point.completionTokens * factor),
    totalTokens: Math.round(point.totalTokens * factor),
    estimatedCostCny: Number((point.estimatedCostCny * factor).toFixed(4)),
    status2xx: Math.round(point.status2xx * factor),
    status4xx: Math.round(point.status4xx * factor),
    status5xx: Math.round(point.status5xx * factor),
  }
}

function applyRowFactor(
  row: UsageAggregateRow,
  factor: number,
  statusFamily: UsageFilterState["statusFamily"],
) {
  const nextErrorRate =
    statusFamily === "all"
      ? row.errorRate
      : statusFamily === "2xx"
        ? Math.max(0, row.errorRate * 0.15)
        : Math.min(100, Math.max(30, row.errorRate * 1.8))

  return {
    ...row,
    requests: Math.round(row.requests * factor),
    totalTokens: Math.round(row.totalTokens * factor),
    estimatedCostCny: Number((row.estimatedCostCny * factor).toFixed(2)),
    errorRate: Number(nextErrorRate.toFixed(2)),
  }
}

function buildMetrics(points: UsageTrendPoint[]) {
  const totals = points.reduce(
    (accumulator, point) => {
      accumulator.promptTokens += point.promptTokens
      accumulator.completionTokens += point.completionTokens
      accumulator.totalTokens += point.totalTokens
      accumulator.totalRequests += point.requests
      accumulator.avgLatencyMs += point.avgLatencyMs
      accumulator.p95LatencyMs += point.p95LatencyMs
      accumulator.estimatedCostCny += point.estimatedCostCny
      accumulator.status2xx += point.status2xx
      accumulator.status4xx += point.status4xx
      accumulator.status5xx += point.status5xx
      return accumulator
    },
    {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      totalRequests: 0,
      avgLatencyMs: 0,
      p95LatencyMs: 0,
      estimatedCostCny: 0,
      status2xx: 0,
      status4xx: 0,
      status5xx: 0,
    },
  )

  const count = Math.max(points.length, 1)

  return {
    promptTokens: totals.promptTokens,
    completionTokens: totals.completionTokens,
    totalTokens: totals.totalTokens,
    avgLatencyMs: Number((totals.avgLatencyMs / count).toFixed(2)),
    p95LatencyMs: Number((totals.p95LatencyMs / count).toFixed(2)),
    successRate: Number(((totals.status2xx / Math.max(totals.totalRequests, 1)) * 100).toFixed(2)),
    totalRequests: totals.totalRequests,
    estimatedCostCny: Number(totals.estimatedCostCny.toFixed(2)),
    status2xx: totals.status2xx,
    status4xx: totals.status4xx,
    status5xx: totals.status5xx,
  }
}

export async function getProjectUsage(
  tenantId: string,
  projectId: string,
  filters: UsageFilterState,
): Promise<ProjectUsageResult> {
  const params = ReadParamsSchema.parse({ tenantId, projectId })
  const parsedFilters = UsageFiltersSchema.parse(filters)

  const currentStore = ensureUsageStore(params.tenantId, params.projectId)
  const sourcePoints =
    parsedFilters.granularity === "hour"
      ? currentStore.payload.trendsHourly
      : currentStore.payload.trendsDaily

  const rangePoints = pickRangePoints(sourcePoints, parsedFilters)

  const dimensionFactor =
    hashFactor(parsedFilters.serviceId) *
    hashFactor(parsedFilters.revisionId) *
    hashFactor(parsedFilters.apiKeyId) *
    hashFactor(parsedFilters.modelVersionId)

  const trends = rangePoints
    .map((item) => applyDimensionFactor(item, dimensionFactor))
    .map((item) => applyStatusFamily(item, parsedFilters.statusFamily))

  const metrics = buildMetrics(trends)

  const aggregateRows = currentStore.payload.aggregates[parsedFilters.groupBy]
    .filter((row) => {
      if (parsedFilters.groupBy === "service" && parsedFilters.serviceId !== "all") {
        return row.rowId === parsedFilters.serviceId
      }
      if (parsedFilters.groupBy === "revision" && parsedFilters.revisionId !== "all") {
        return row.rowId === parsedFilters.revisionId
      }
      if (parsedFilters.groupBy === "apiKey" && parsedFilters.apiKeyId !== "all") {
        return row.rowId === parsedFilters.apiKeyId
      }
      if (parsedFilters.groupBy === "modelVersion" && parsedFilters.modelVersionId !== "all") {
        return row.rowId === parsedFilters.modelVersionId
      }
      if (parsedFilters.groupBy === "statusCode" && parsedFilters.statusFamily !== "all") {
        return row.groupValue === parsedFilters.statusFamily
      }
      return true
    })
    .map((row) => applyRowFactor(row, dimensionFactor, parsedFilters.statusFamily))

  return {
    filters: parsedFilters,
    filterOptions: currentStore.payload.filterOptions,
    metrics: {
      promptTokens: metrics.promptTokens,
      completionTokens: metrics.completionTokens,
      totalTokens: metrics.totalTokens,
      avgLatencyMs: metrics.avgLatencyMs,
      p95LatencyMs: metrics.p95LatencyMs,
      successRate: metrics.successRate,
      totalRequests: metrics.totalRequests,
      estimatedCostCny: metrics.estimatedCostCny,
    },
    trends,
    aggregates: aggregateRows,
    statusCodeDistribution: [
      { name: "2xx", value: metrics.status2xx },
      { name: "4xx", value: metrics.status4xx },
      { name: "5xx", value: metrics.status5xx },
    ],
    updatedAt: currentStore.payload.updatedAt,
  }
}
