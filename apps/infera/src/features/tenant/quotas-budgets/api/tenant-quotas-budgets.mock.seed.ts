import type {
  TenantBudgetsPolicy,
  TenantPolicyCapabilities,
  TenantPolicyHistoryItem,
  TenantQuotasPolicy,
} from "../types/tenant-quotas-budgets"

export interface TenantQuotasBudgetsSeed {
  quotasPolicy: TenantQuotasPolicy
  budgetsPolicy: TenantBudgetsPolicy
  capabilities: TenantPolicyCapabilities
  policyHistory: TenantPolicyHistoryItem[]
}

function buildHistoryItem(
  id: string,
  policyType: TenantPolicyHistoryItem["policyType"],
  action: string,
  actorName: string,
  summary: string,
  changedFields: string[],
  createdAt: string,
): TenantPolicyHistoryItem {
  return {
    id,
    policyType,
    action,
    actorName,
    actorType: "user",
    summary,
    changedFields,
    createdAt,
  }
}

export const TENANT_QUOTAS_BUDGETS_SEEDS: Record<string, TenantQuotasBudgetsSeed> = {
  "1": {
    quotasPolicy: {
      mode: "simple",
      simple: {
        maxProjects: 32,
        maxServices: 96,
        dailyTokenLimit: 220000000,
        concurrentRequests: 1200,
        gpuPoolQuotas: [
          {
            acceleratorType: "NVIDIA L40S",
            maxCards: 16,
            usedCards: 9,
          },
          {
            acceleratorType: "NVIDIA H100",
            maxCards: 8,
            usedCards: 3,
          },
          {
            acceleratorType: "NVIDIA A10",
            maxCards: 24,
            usedCards: 11,
          },
        ],
      },
      advancedJson: JSON.stringify(
        {
          maxProjects: 32,
          maxServices: 96,
          dailyTokenLimit: 220000000,
          concurrentRequests: 1200,
          gpuPoolQuotas: [
            { acceleratorType: "NVIDIA L40S", maxCards: 16 },
            { acceleratorType: "NVIDIA H100", maxCards: 8 },
            { acceleratorType: "NVIDIA A10", maxCards: 24 },
          ],
        },
        null,
        2,
      ),
      updatedAt: "2026-02-09T03:20:14Z",
      updatedBy: "王立志",
    },
    budgetsPolicy: {
      dailyBudgetCny: 18000,
      monthlyBudgetCny: 360000,
      alertThresholds: [0.5, 0.8, 1],
      overageAction: "alert_only",
      notifyByEmail: true,
      webhookUrl: "https://hooks.example.com/infera/tenant-1/cost",
      webhookSecretMasked: "sk_live_****_3f9a",
      updatedAt: "2026-02-10T08:41:20Z",
      updatedBy: "李子墨",
    },
    capabilities: {
      canEditQuotas: true,
      canEditBudgets: true,
      canUseAdvancedMode: true,
    },
    policyHistory: [
      buildHistoryItem(
        "tph_20260210_001",
        "budgets",
        "UPDATE",
        "李子墨",
        "调整月预算与告警阈值，保持超限动作为仅告警。",
        ["monthlyBudgetCny", "alertThresholds"],
        "2026-02-10T08:41:20Z",
      ),
      buildHistoryItem(
        "tph_20260209_003",
        "quotas",
        "UPDATE",
        "王立志",
        "提高 L40S 与 A10 配额，支撑新模型上线流量。",
        ["gpuPoolQuotas"],
        "2026-02-09T03:20:14Z",
      ),
      buildHistoryItem(
        "tph_20260207_002",
        "budgets",
        "UPDATE",
        "财务机器人",
        "新增 100% 预算阈值自动告警。",
        ["alertThresholds"],
        "2026-02-07T11:06:35Z",
      ),
      buildHistoryItem(
        "tph_20260206_001",
        "quotas",
        "UPDATE",
        "王立志",
        "设置并发请求上限，抑制峰值抖动。",
        ["concurrentRequests"],
        "2026-02-06T02:19:49Z",
      ),
    ],
  },
  "2": {
    quotasPolicy: {
      mode: "simple",
      simple: {
        maxProjects: 12,
        maxServices: 28,
        dailyTokenLimit: 45000000,
        concurrentRequests: 360,
        gpuPoolQuotas: [
          {
            acceleratorType: "NVIDIA L40S",
            maxCards: 4,
            usedCards: 2,
          },
        ],
      },
      advancedJson: JSON.stringify(
        {
          maxProjects: 12,
          maxServices: 28,
          dailyTokenLimit: 45000000,
          concurrentRequests: 360,
          gpuPoolQuotas: [{ acceleratorType: "NVIDIA L40S", maxCards: 4 }],
        },
        null,
        2,
      ),
      updatedAt: "2026-02-08T06:33:00Z",
      updatedBy: "系统默认策略",
    },
    budgetsPolicy: {
      dailyBudgetCny: 6800,
      monthlyBudgetCny: 120000,
      alertThresholds: [0.8, 1],
      overageAction: "alert_only",
      notifyByEmail: true,
      webhookUrl: null,
      webhookSecretMasked: null,
      updatedAt: "2026-02-09T15:09:18Z",
      updatedBy: "张若尘",
    },
    capabilities: {
      canEditQuotas: false,
      canEditBudgets: true,
      canUseAdvancedMode: false,
    },
    policyHistory: [
      buildHistoryItem(
        "tph_20260209_101",
        "budgets",
        "UPDATE",
        "张若尘",
        "设置月预算预警门槛。",
        ["monthlyBudgetCny", "alertThresholds"],
        "2026-02-09T15:09:18Z",
      ),
      buildHistoryItem(
        "tph_20260208_102",
        "quotas",
        "UPDATE",
        "系统默认策略",
        "初始化租户基础配额。",
        ["maxProjects", "maxServices", "dailyTokenLimit", "gpuPoolQuotas"],
        "2026-02-08T06:33:00Z",
      ),
    ],
  },
}
