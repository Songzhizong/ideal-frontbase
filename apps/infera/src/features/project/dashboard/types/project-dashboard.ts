export const PROJECT_DASHBOARD_RANGES = ["1h", "24h", "7d"] as const

export type ProjectDashboardRange = (typeof PROJECT_DASHBOARD_RANGES)[number]

export const PROJECT_DEPLOYMENT_RESULTS = ["Succeeded", "Failed", "RollingBack"] as const

export type ProjectDeploymentResult = (typeof PROJECT_DEPLOYMENT_RESULTS)[number]

export const PROJECT_ALERT_SEVERITIES = ["Critical", "High", "Medium", "Low"] as const

export type ProjectAlertSeverity = (typeof PROJECT_ALERT_SEVERITIES)[number]

export const PROJECT_ALERT_STATUSES = ["Open", "Acknowledged"] as const

export type ProjectAlertStatus = (typeof PROJECT_ALERT_STATUSES)[number]

export interface ProjectDashboardMetrics {
  readyServiceCount: number
  totalServiceCount: number
  modelAssetCount: number
  modelVersionCount: number
  monthlyEstimatedCostCny: number
  tokensToday: number
  errorRate: number
}

export interface ProjectDashboardDeploymentItem {
  id: string
  serviceName: string
  serviceId: string
  revisionId: string
  operator: string
  deployedAt: string
  result: ProjectDeploymentResult
}

export interface ProjectDashboardAlertItem {
  alertId: string
  name: string
  severity: ProjectAlertSeverity
  status: ProjectAlertStatus
  resourceType: string
  resourceName: string
  triggeredAt: string
  summary: string
}

export interface ProjectDashboardAuditEvent {
  id: string
  actor: string
  action: string
  resourceType: string
  resourceName: string
  happenedAt: string
}

export interface ProjectDashboardResponse {
  lastUpdatedAt: string
  metrics: ProjectDashboardMetrics
  recentDeployments: ProjectDashboardDeploymentItem[]
  activeAlerts: ProjectDashboardAlertItem[]
  recentAudits: ProjectDashboardAuditEvent[]
}

export interface AckProjectDashboardAlertInput {
  tenantId: string
  projectId: string
  alertId: string
}
