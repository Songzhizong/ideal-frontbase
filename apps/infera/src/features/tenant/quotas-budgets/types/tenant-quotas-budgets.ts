export const TENANT_QUOTAS_POLICY_MODES = ["simple", "advanced"] as const
export type TenantQuotasPolicyMode = (typeof TENANT_QUOTAS_POLICY_MODES)[number]

export const TENANT_BUDGET_OVERAGE_ACTIONS = ["alert_only", "block_inference"] as const
export type TenantBudgetOverageAction = (typeof TENANT_BUDGET_OVERAGE_ACTIONS)[number]

export const TENANT_POLICY_HISTORY_TYPES = ["quotas", "budgets"] as const
export type TenantPolicyHistoryType = (typeof TENANT_POLICY_HISTORY_TYPES)[number]

export interface TenantGpuPoolQuota {
  acceleratorType: string
  maxCards: number | null
  usedCards: number
}

export interface TenantQuotasSimplePolicy {
  maxProjects: number | null
  maxServices: number | null
  dailyTokenLimit: number | null
  concurrentRequests: number | null
  gpuPoolQuotas: TenantGpuPoolQuota[]
}

export interface TenantQuotasPolicy {
  mode: TenantQuotasPolicyMode
  simple: TenantQuotasSimplePolicy
  advancedJson: string
  updatedAt: string
  updatedBy: string
}

export interface TenantBudgetsPolicy {
  dailyBudgetCny: number | null
  monthlyBudgetCny: number | null
  alertThresholds: number[]
  overageAction: TenantBudgetOverageAction
  notifyByEmail: boolean
  webhookUrl: string | null
  webhookSecretMasked: string | null
  updatedAt: string
  updatedBy: string
}

export interface TenantPolicyCapabilities {
  canEditQuotas: boolean
  canEditBudgets: boolean
  canUseAdvancedMode: boolean
}

export interface TenantQuotasBudgetsResponse {
  tenantId: string
  quotasPolicy: TenantQuotasPolicy
  budgetsPolicy: TenantBudgetsPolicy
  capabilities: TenantPolicyCapabilities
}

export interface TenantPolicyHistoryItem {
  id: string
  policyType: TenantPolicyHistoryType
  action: string
  actorName: string
  actorType: "user" | "service_account"
  summary: string
  changedFields: string[]
  createdAt: string
}

export interface TenantPolicyHistoryResponse {
  items: TenantPolicyHistoryItem[]
}

export interface UpdateTenantQuotasPolicyInput {
  tenantId: string
  mode: TenantQuotasPolicyMode
  simple: TenantQuotasSimplePolicy
  advancedJson: string
}

export interface UpdateTenantBudgetsPolicyInput {
  tenantId: string
  dailyBudgetCny: number | null
  monthlyBudgetCny: number | null
  alertThresholds: number[]
  overageAction: TenantBudgetOverageAction
  notifyByEmail: boolean
  webhookUrl: string | null
  webhookSecret: string | null
}
