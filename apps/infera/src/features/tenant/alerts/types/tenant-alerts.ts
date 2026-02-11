export const TENANT_ALERT_SEVERITIES = ["S1", "S2", "S3"] as const
export type TenantAlertSeverity = (typeof TENANT_ALERT_SEVERITIES)[number]

export const TENANT_ALERT_TYPES = [
  "cost",
  "error_rate",
  "latency",
  "pending_timeout",
  "cold_start",
] as const
export type TenantAlertType = (typeof TENANT_ALERT_TYPES)[number]

export const TENANT_ALERT_SCOPE_TYPES = ["tenant", "project", "service"] as const
export type TenantAlertScopeType = (typeof TENANT_ALERT_SCOPE_TYPES)[number]

export const TENANT_ALERT_STATUSES = ["Open", "Ack", "Resolved"] as const
export type TenantAlertStatus = (typeof TENANT_ALERT_STATUSES)[number]

export const TENANT_ALERT_EVENTS = ["Triggered", "Acked", "Resolved"] as const
export type TenantAlertEvent = (typeof TENANT_ALERT_EVENTS)[number]

export const TENANT_ALERT_SCOPE_MODES = ["all_tenant", "projects", "services"] as const
export type TenantAlertScopeMode = (typeof TENANT_ALERT_SCOPE_MODES)[number]

export const TENANT_ALERT_CHANNELS = ["Email", "Webhook"] as const
export type TenantAlertChannel = (typeof TENANT_ALERT_CHANNELS)[number]

export const TENANT_ALERT_OVERAGE_ACTIONS = ["alert_only", "block_inference"] as const
export type TenantAlertOverageAction = (typeof TENANT_ALERT_OVERAGE_ACTIONS)[number]

export interface TenantAlertProjectOption {
  projectId: string
  projectName: string
}

export interface TenantAlertServiceOption {
  serviceId: string
  serviceName: string
  projectId: string
}

export interface TenantAlertCondition {
  metric: string
  operator: ">" | ">="
  threshold: number
  unit: string
  durationMinutes: number
}

export interface TenantActiveAlertItem {
  alertId: string
  severity: TenantAlertSeverity
  type: TenantAlertType
  scopeType: TenantAlertScopeType
  scopeName: string
  projectId: string | null
  serviceId: string | null
  triggeredAt: string
  currentValue: number
  thresholdValue: number
  unit: string
  status: TenantAlertStatus
  summary: string
}

export interface TenantAlertRuleItem {
  ruleId: string
  name: string
  type: TenantAlertType
  scopeMode: TenantAlertScopeMode
  projectIds: string[]
  serviceIds: string[]
  scopeLabel: string
  condition: TenantAlertCondition
  channels: TenantAlertChannel[]
  webhookUrl: string | null
  overageAction: TenantAlertOverageAction | null
  enabled: boolean
  updatedAt: string
  updatedBy: string
}

export interface TenantAlertHistoryItem {
  historyId: string
  alertId: string
  event: TenantAlertEvent
  type: TenantAlertType
  scopeName: string
  status: TenantAlertStatus
  happenedAt: string
  actor: string
  detail: string
}

export interface TenantActiveAlertsResponse {
  items: TenantActiveAlertItem[]
}

export interface TenantAlertRulesResponse {
  items: TenantAlertRuleItem[]
  projectOptions: TenantAlertProjectOption[]
  serviceOptions: TenantAlertServiceOption[]
}

export interface TenantAlertHistoryResponse {
  items: TenantAlertHistoryItem[]
}

export interface UpsertTenantAlertRulePayload {
  name: string
  type: TenantAlertType
  scopeMode: TenantAlertScopeMode
  projectIds: string[]
  serviceIds: string[]
  condition: TenantAlertCondition
  channels: TenantAlertChannel[]
  webhookUrl: string | null
  overageAction: TenantAlertOverageAction | null
  enabled: boolean
}

export interface CreateTenantAlertRuleInput {
  tenantId: string
  payload: UpsertTenantAlertRulePayload
}

export interface UpdateTenantAlertRuleInput {
  tenantId: string
  ruleId: string
  payload: UpsertTenantAlertRulePayload
}

export interface ToggleTenantAlertRuleInput {
  tenantId: string
  ruleId: string
  enabled: boolean
}

export interface DeleteTenantAlertRuleInput {
  tenantId: string
  ruleId: string
}

export interface AckTenantAlertInput {
  tenantId: string
  alertId: string
}
