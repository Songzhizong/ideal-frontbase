export type UsageTimeRange = "24h" | "7d" | "30d"

export type UsageGroupBy = "service" | "revision" | "apiKey" | "modelVersion" | "statusCode"

export type UsageGranularity = "hour" | "day"

export type UsageStatusFamily = "all" | "2xx" | "4xx" | "5xx"

export interface UsageFilterState {
  range: UsageTimeRange
  groupBy: UsageGroupBy
  granularity: UsageGranularity
  serviceId: string
  revisionId: string
  apiKeyId: string
  modelVersionId: string
  statusFamily: UsageStatusFamily
}

export interface UsageFilterOption {
  label: string
  value: string
}

export interface UsageFilterOptions {
  services: UsageFilterOption[]
  revisions: UsageFilterOption[]
  apiKeys: UsageFilterOption[]
  modelVersions: UsageFilterOption[]
}

export interface UsageMetricSummary {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  avgLatencyMs: number
  p95LatencyMs: number
  successRate: number
  totalRequests: number
  estimatedCostCny: number
}

export interface UsageTrendPoint {
  timestamp: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  requests: number
  avgLatencyMs: number
  p95LatencyMs: number
  estimatedCostCny: number
  status2xx: number
  status4xx: number
  status5xx: number
}

export interface UsageAggregateRow {
  rowId: string
  groupLabel: string
  groupValue: string
  requests: number
  totalTokens: number
  avgLatencyMs: number
  p95LatencyMs: number
  errorRate: number
  estimatedCostCny: number
  drilldown: {
    type: "service" | "apiKey"
    id: string
  } | null
}

export interface ProjectUsageResult {
  filters: UsageFilterState
  filterOptions: UsageFilterOptions
  metrics: UsageMetricSummary
  trends: UsageTrendPoint[]
  aggregates: UsageAggregateRow[]
  statusCodeDistribution: Array<{ name: "2xx" | "4xx" | "5xx"; value: number }>
  updatedAt: string
}
