export type TenantOverviewRange = "7d" | "30d"
export type TenantProjectEnvironment = "Dev" | "Test" | "Prod"

export interface TenantOverviewMetrics {
  accountBalanceCny: number | null
  monthlyEstimatedCostCny: number
  tokensToday: number
  activeProjectCount: number
  activeServiceCount: number
  totalServiceCount?: number
  openAlertCount: number
}

export interface TenantOverviewCostPoint {
  date: string
  costCny: number
}

export interface TenantOverviewProjectCostItem {
  projectId: string
  projectName: string
  environment: TenantProjectEnvironment
  monthlyEstimatedCostCny: number
  costTrendChange?: number
  tokensToday: number
  tokensTrendChange?: number
  tokensSparklineData?: number[]
  readyServiceCount: number
  totalServiceCount: number
}

export interface TenantOverviewAuditEvent {
  id: string
  actor: string
  action: string
  resourceType: string
  resourceName: string
  happenedAt: string
}

export interface TenantOverviewResponse {
  metrics: TenantOverviewMetrics
  costTrend: TenantOverviewCostPoint[]
  topProjects: TenantOverviewProjectCostItem[]
  recentAudits: TenantOverviewAuditEvent[]
}
