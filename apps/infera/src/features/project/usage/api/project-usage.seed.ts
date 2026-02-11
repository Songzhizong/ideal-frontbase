import type {
  ProjectUsageResult,
  UsageAggregateRow,
  UsageFilterOptions,
  UsageGroupBy,
  UsageTrendPoint,
} from "../types"

interface UsageSeedStore {
  filterOptions: UsageFilterOptions
  trendsHourly: UsageTrendPoint[]
  trendsDaily: UsageTrendPoint[]
  aggregates: Record<UsageGroupBy, UsageAggregateRow[]>
  updatedAt: string
}

function toIsoFromNow(hoursAgo: number) {
  return new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()
}

function createHourlyTrends(seed: number): UsageTrendPoint[] {
  return Array.from({ length: 24 * 30 }, (_, index) => {
    const hoursAgo = 24 * 30 - 1 - index
    const requests = 55 + ((seed * 17 + index * 9) % 130)
    const status4xx = index % 14 === 0 ? 6 : 2 + ((seed + index) % 4)
    const status5xx = index % 22 === 0 ? 2 : (seed + index) % 2
    const status2xx = Math.max(0, requests - status4xx - status5xx)

    const promptTokens = requests * (45 + ((seed + index) % 22))
    const completionTokens = requests * (88 + ((seed * 3 + index) % 38))
    const totalTokens = promptTokens + completionTokens
    const estimatedCostCny = Number(((totalTokens / 1000) * 0.0062).toFixed(4))

    return {
      timestamp: toIsoFromNow(hoursAgo),
      requests,
      promptTokens,
      completionTokens,
      totalTokens,
      avgLatencyMs: 55 + ((seed * 5 + index * 3) % 45),
      p95LatencyMs: 95 + ((seed * 11 + index * 7) % 80),
      estimatedCostCny,
      status2xx,
      status4xx,
      status5xx,
    }
  })
}

function createDailyTrends(hourly: UsageTrendPoint[]) {
  const daily: UsageTrendPoint[] = []

  for (let dayIndex = 0; dayIndex < 30; dayIndex += 1) {
    const dayPoints = hourly.slice(dayIndex * 24, dayIndex * 24 + 24)
    const first = dayPoints[0]
    if (!first) {
      continue
    }

    const merged = dayPoints.reduce(
      (accumulator, item) => {
        accumulator.requests += item.requests
        accumulator.promptTokens += item.promptTokens
        accumulator.completionTokens += item.completionTokens
        accumulator.totalTokens += item.totalTokens
        accumulator.avgLatencyMs += item.avgLatencyMs
        accumulator.p95LatencyMs += item.p95LatencyMs
        accumulator.estimatedCostCny += item.estimatedCostCny
        accumulator.status2xx += item.status2xx
        accumulator.status4xx += item.status4xx
        accumulator.status5xx += item.status5xx
        return accumulator
      },
      {
        requests: 0,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        avgLatencyMs: 0,
        p95LatencyMs: 0,
        estimatedCostCny: 0,
        status2xx: 0,
        status4xx: 0,
        status5xx: 0,
      },
    )

    daily.push({
      timestamp: first.timestamp,
      requests: merged.requests,
      promptTokens: merged.promptTokens,
      completionTokens: merged.completionTokens,
      totalTokens: merged.totalTokens,
      avgLatencyMs: Math.round(merged.avgLatencyMs / dayPoints.length),
      p95LatencyMs: Math.round(merged.p95LatencyMs / dayPoints.length),
      estimatedCostCny: Number(merged.estimatedCostCny.toFixed(3)),
      status2xx: merged.status2xx,
      status4xx: merged.status4xx,
      status5xx: merged.status5xx,
    })
  }

  return daily
}

function createAggregateRows(seed: number): Record<UsageGroupBy, UsageAggregateRow[]> {
  return {
    service: [
      {
        rowId: "svc-chat-gateway",
        groupLabel: "service",
        groupValue: "chat-gateway",
        requests: 78_220 + seed * 13,
        totalTokens: 8_326_000 + seed * 200,
        avgLatencyMs: 58,
        p95LatencyMs: 131,
        errorRate: 1.8,
        estimatedCostCny: 520.32,
        drilldown: { type: "service", id: "svc-chat-gateway" },
      },
      {
        rowId: "svc-rag-router",
        groupLabel: "service",
        groupValue: "rag-router",
        requests: 62_040 + seed * 11,
        totalTokens: 6_741_000 + seed * 160,
        avgLatencyMs: 67,
        p95LatencyMs: 149,
        errorRate: 2.6,
        estimatedCostCny: 420.14,
        drilldown: { type: "service", id: "svc-rag-router" },
      },
      {
        rowId: "svc-embed-worker",
        groupLabel: "service",
        groupValue: "embed-worker",
        requests: 29_310 + seed * 9,
        totalTokens: 2_982_000 + seed * 110,
        avgLatencyMs: 43,
        p95LatencyMs: 98,
        errorRate: 1.2,
        estimatedCostCny: 188.66,
        drilldown: { type: "service", id: "svc-embed-worker" },
      },
    ],
    revision: [
      {
        rowId: "rev-chat-20260210",
        groupLabel: "revision",
        groupValue: "rev-chat-20260210",
        requests: 61_300,
        totalTokens: 6_550_000,
        avgLatencyMs: 57,
        p95LatencyMs: 128,
        errorRate: 1.6,
        estimatedCostCny: 412.15,
        drilldown: null,
      },
      {
        rowId: "rev-chat-20260203",
        groupLabel: "revision",
        groupValue: "rev-chat-20260203",
        requests: 22_900,
        totalTokens: 2_510_000,
        avgLatencyMs: 62,
        p95LatencyMs: 141,
        errorRate: 2.3,
        estimatedCostCny: 156.8,
        drilldown: null,
      },
      {
        rowId: "rev-rag-20260208",
        groupLabel: "revision",
        groupValue: "rev-rag-20260208",
        requests: 48_200,
        totalTokens: 5_008_000,
        avgLatencyMs: 69,
        p95LatencyMs: 152,
        errorRate: 2.9,
        estimatedCostCny: 312.24,
        drilldown: null,
      },
    ],
    apiKey: [
      {
        rowId: "ak-project-chat",
        groupLabel: "api_key",
        groupValue: "chat-gateway-prod",
        requests: 66_900,
        totalTokens: 7_226_000,
        avgLatencyMs: 59,
        p95LatencyMs: 133,
        errorRate: 1.9,
        estimatedCostCny: 451.6,
        drilldown: { type: "apiKey", id: "ak-project-chat" },
      },
      {
        rowId: "ak-project-eval",
        groupLabel: "api_key",
        groupValue: "eval-batch-runner",
        requests: 47_100,
        totalTokens: 4_788_000,
        avgLatencyMs: 65,
        p95LatencyMs: 147,
        errorRate: 2.4,
        estimatedCostCny: 299.45,
        drilldown: { type: "apiKey", id: "ak-project-eval" },
      },
      {
        rowId: "ak-project-expired",
        groupLabel: "api_key",
        groupValue: "temporary-debug",
        requests: 8_600,
        totalTokens: 912_000,
        avgLatencyMs: 72,
        p95LatencyMs: 168,
        errorRate: 6.2,
        estimatedCostCny: 56.22,
        drilldown: { type: "apiKey", id: "ak-project-expired" },
      },
    ],
    modelVersion: [
      {
        rowId: "mv-chat-v4",
        groupLabel: "model_version",
        groupValue: "mv-chat-v4",
        requests: 69_120,
        totalTokens: 7_980_000,
        avgLatencyMs: 60,
        p95LatencyMs: 140,
        errorRate: 2,
        estimatedCostCny: 489.2,
        drilldown: null,
      },
      {
        rowId: "mv-rag-v2",
        groupLabel: "model_version",
        groupValue: "mv-rag-v2",
        requests: 56_340,
        totalTokens: 5_440_000,
        avgLatencyMs: 67,
        p95LatencyMs: 152,
        errorRate: 2.8,
        estimatedCostCny: 345.2,
        drilldown: null,
      },
      {
        rowId: "mv-embed-v1",
        groupLabel: "model_version",
        groupValue: "mv-embed-v1",
        requests: 18_990,
        totalTokens: 1_920_000,
        avgLatencyMs: 43,
        p95LatencyMs: 96,
        errorRate: 1.1,
        estimatedCostCny: 117.9,
        drilldown: null,
      },
    ],
    statusCode: [
      {
        rowId: "status-2xx",
        groupLabel: "status_code",
        groupValue: "2xx",
        requests: 141_500,
        totalTokens: 13_820_000,
        avgLatencyMs: 58,
        p95LatencyMs: 136,
        errorRate: 0,
        estimatedCostCny: 872.22,
        drilldown: null,
      },
      {
        rowId: "status-4xx",
        groupLabel: "status_code",
        groupValue: "4xx",
        requests: 8_720,
        totalTokens: 1_040_000,
        avgLatencyMs: 69,
        p95LatencyMs: 161,
        errorRate: 100,
        estimatedCostCny: 63.88,
        drilldown: null,
      },
      {
        rowId: "status-5xx",
        groupLabel: "status_code",
        groupValue: "5xx",
        requests: 2_240,
        totalTokens: 306_000,
        avgLatencyMs: 73,
        p95LatencyMs: 176,
        errorRate: 100,
        estimatedCostCny: 18.8,
        drilldown: null,
      },
    ],
  }
}

export function createProjectUsageSeed(projectId: string): UsageSeedStore {
  const seed = projectId
    .split("")
    .reduce((accumulator, char) => accumulator + char.charCodeAt(0), 0)

  const trendsHourly = createHourlyTrends(seed)

  const filterOptions: ProjectUsageResult["filterOptions"] = {
    services: [
      { label: "chat-gateway", value: "svc-chat-gateway" },
      { label: "rag-router", value: "svc-rag-router" },
      { label: "embed-worker", value: "svc-embed-worker" },
    ],
    revisions: [
      { label: "rev-chat-20260210", value: "rev-chat-20260210" },
      { label: "rev-chat-20260203", value: "rev-chat-20260203" },
      { label: "rev-rag-20260208", value: "rev-rag-20260208" },
    ],
    apiKeys: [
      { label: "chat-gateway-prod", value: "ak-project-chat" },
      { label: "eval-batch-runner", value: "ak-project-eval" },
      { label: "temporary-debug", value: "ak-project-expired" },
    ],
    modelVersions: [
      { label: "mv-chat-v4", value: "mv-chat-v4" },
      { label: "mv-rag-v2", value: "mv-rag-v2" },
      { label: "mv-embed-v1", value: "mv-embed-v1" },
    ],
  }

  return {
    filterOptions,
    trendsHourly,
    trendsDaily: createDailyTrends(trendsHourly),
    aggregates: createAggregateRows(seed),
    updatedAt: new Date().toISOString(),
  }
}
