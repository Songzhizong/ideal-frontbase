import { delay, HttpResponse, http } from "msw"
import { mockRegistry } from "@/packages/mock-core"
import type {
  TenantBudgetOverageAction,
  TenantBudgetsPolicy,
  TenantGpuPoolQuota,
  TenantPolicyHistoryItem,
  TenantQuotasBudgetsResponse,
  TenantQuotasPolicy,
  TenantQuotasSimplePolicy,
} from "../types/tenant-quotas-budgets"
import {
  TENANT_BUDGET_OVERAGE_ACTIONS,
  TENANT_QUOTAS_POLICY_MODES,
} from "../types/tenant-quotas-budgets"
import {
  TENANT_QUOTAS_BUDGETS_SEEDS,
  type TenantQuotasBudgetsSeed,
} from "./tenant-quotas-budgets.mock.seed"

interface TenantQuotasBudgetsStoreState {
  quotasPolicy: TenantQuotasPolicy
  budgetsPolicy: TenantBudgetsPolicy
  capabilities: TenantQuotasBudgetsResponse["capabilities"]
  policyHistory: TenantPolicyHistoryItem[]
}

const tenantQuotasBudgetsStore = new Map<string, TenantQuotasBudgetsStoreState>()

function getDefaultSeed() {
  const seed = TENANT_QUOTAS_BUDGETS_SEEDS["1"]
  if (!seed) {
    throw new Error("TENANT_QUOTAS_BUDGETS_SEEDS requires a default tenant seed.")
  }
  return seed
}

const DEFAULT_SEED = getDefaultSeed()

function cloneGpuPoolQuota(item: TenantGpuPoolQuota): TenantGpuPoolQuota {
  return {
    ...item,
  }
}

function cloneSimplePolicy(simple: TenantQuotasSimplePolicy): TenantQuotasSimplePolicy {
  return {
    ...simple,
    gpuPoolQuotas: simple.gpuPoolQuotas.map((item) => cloneGpuPoolQuota(item)),
  }
}

function cloneQuotasPolicy(policy: TenantQuotasPolicy): TenantQuotasPolicy {
  return {
    ...policy,
    simple: cloneSimplePolicy(policy.simple),
  }
}

function cloneBudgetsPolicy(policy: TenantBudgetsPolicy): TenantBudgetsPolicy {
  return {
    ...policy,
    alertThresholds: [...policy.alertThresholds],
  }
}

function clonePolicyHistoryItem(item: TenantPolicyHistoryItem): TenantPolicyHistoryItem {
  return {
    ...item,
    changedFields: [...item.changedFields],
  }
}

function cloneStoreState(seed: TenantQuotasBudgetsSeed): TenantQuotasBudgetsStoreState {
  return {
    quotasPolicy: cloneQuotasPolicy(seed.quotasPolicy),
    budgetsPolicy: cloneBudgetsPolicy(seed.budgetsPolicy),
    capabilities: {
      ...seed.capabilities,
    },
    policyHistory: seed.policyHistory.map((item) => clonePolicyHistoryItem(item)),
  }
}

function getStoreState(tenantId: string): TenantQuotasBudgetsStoreState {
  const existing = tenantQuotasBudgetsStore.get(tenantId)
  if (existing) {
    return existing
  }

  const seed = TENANT_QUOTAS_BUDGETS_SEEDS[tenantId] ?? DEFAULT_SEED
  const nextState = cloneStoreState(seed)
  tenantQuotasBudgetsStore.set(tenantId, nextState)
  return nextState
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parseNullableNumber(value: unknown) {
  if (value === null) {
    return null
  }

  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value
  }

  return null
}

function normalizeSimplePolicy(rawValue: unknown): TenantQuotasSimplePolicy | null {
  if (!isRecord(rawValue)) {
    return null
  }

  const gpuPoolQuotasRaw = rawValue.gpuPoolQuotas
  const gpuPoolQuotas = Array.isArray(gpuPoolQuotasRaw)
    ? gpuPoolQuotasRaw.flatMap((item) => {
        if (!isRecord(item)) {
          return []
        }

        const acceleratorType =
          typeof item.acceleratorType === "string" ? item.acceleratorType.trim() : ""
        if (acceleratorType.length === 0) {
          return []
        }

        const maxCards = parseNullableNumber(item.maxCards)
        const usedCardsRaw = parseNullableNumber(item.usedCards)

        return [
          {
            acceleratorType,
            maxCards,
            usedCards: usedCardsRaw ?? 0,
          },
        ] satisfies TenantGpuPoolQuota[]
      })
    : []

  return {
    maxProjects: parseNullableNumber(rawValue.maxProjects),
    maxServices: parseNullableNumber(rawValue.maxServices),
    dailyTokenLimit: parseNullableNumber(rawValue.dailyTokenLimit),
    concurrentRequests: parseNullableNumber(rawValue.concurrentRequests),
    gpuPoolQuotas,
  }
}

function parseThresholds(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  const thresholds = value
    .flatMap((item) => {
      if (typeof item === "number" && Number.isFinite(item)) {
        return [item]
      }

      return []
    })
    .filter((item) => item > 0 && item <= 1)

  return [...new Set(thresholds)].sort((a, b) => a - b)
}

function parseWebhookUrl(value: unknown) {
  if (value === null) {
    return null
  }

  if (typeof value !== "string") {
    return null
  }

  const trimmed = value.trim()
  if (trimmed.length === 0) {
    return null
  }

  try {
    const url = new URL(trimmed)
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null
    }
    return trimmed
  } catch {
    return null
  }
}

function parseOverageAction(value: unknown): TenantBudgetOverageAction | null {
  if (typeof value !== "string") {
    return null
  }

  if (TENANT_BUDGET_OVERAGE_ACTIONS.includes(value as TenantBudgetOverageAction)) {
    return value as TenantBudgetOverageAction
  }

  return null
}

function buildPolicyHistoryItem(
  policyType: TenantPolicyHistoryItem["policyType"],
  summary: string,
  changedFields: string[],
): TenantPolicyHistoryItem {
  const now = new Date().toISOString()

  return {
    id: `tph_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    policyType,
    action: "UPDATE",
    actorName: "当前用户",
    actorType: "user",
    summary,
    changedFields,
    createdAt: now,
  }
}

function toResponse(
  tenantId: string,
  state: TenantQuotasBudgetsStoreState,
): TenantQuotasBudgetsResponse {
  return {
    tenantId,
    quotasPolicy: cloneQuotasPolicy(state.quotasPolicy),
    budgetsPolicy: cloneBudgetsPolicy(state.budgetsPolicy),
    capabilities: {
      ...state.capabilities,
    },
  }
}

export const tenantQuotasBudgetsHandlers = [
  http.get("*/infera-api/tenants/:tenantId/quotas-budgets", async ({ params }) => {
    await delay(260)

    const tenantId = typeof params.tenantId === "string" ? params.tenantId : ""
    const state = getStoreState(tenantId)
    return HttpResponse.json(toResponse(tenantId, state))
  }),
  http.get("*/infera-api/tenants/:tenantId/quotas-budgets/policy-history", async ({ params }) => {
    await delay(280)

    const tenantId = typeof params.tenantId === "string" ? params.tenantId : ""
    const state = getStoreState(tenantId)

    return HttpResponse.json({
      items: state.policyHistory.map((item) => clonePolicyHistoryItem(item)),
    })
  }),
  http.put(
    "*/infera-api/tenants/:tenantId/quotas-budgets/quotas-policy",
    async ({ params, request }) => {
      await delay(360)

      const tenantId = typeof params.tenantId === "string" ? params.tenantId : ""
      const state = getStoreState(tenantId)

      if (!state.capabilities.canEditQuotas) {
        return HttpResponse.json(
          {
            title: "forbidden",
            detail: "当前角色无权限修改配额策略。",
          },
          { status: 403 },
        )
      }

      const payload = (await request.json()) as Record<string, unknown>
      const mode = typeof payload.mode === "string" ? payload.mode : ""

      if (!TENANT_QUOTAS_POLICY_MODES.includes(mode as TenantQuotasPolicy["mode"])) {
        return HttpResponse.json(
          {
            title: "validation_error",
            detail: "配额策略模式无效。",
          },
          { status: 400 },
        )
      }

      const simple = normalizeSimplePolicy(payload.simple)
      if (!simple) {
        return HttpResponse.json(
          {
            title: "validation_error",
            detail: "配额策略字段无效。",
          },
          { status: 400 },
        )
      }

      const advancedJson =
        typeof payload.advancedJson === "string" ? payload.advancedJson.trim() : ""
      if (mode === "advanced") {
        if (!state.capabilities.canUseAdvancedMode) {
          return HttpResponse.json(
            {
              title: "forbidden",
              detail: "当前角色无权限使用 JSON 高级模式。",
            },
            { status: 403 },
          )
        }

        if (advancedJson.length === 0) {
          return HttpResponse.json(
            {
              title: "validation_error",
              detail: "高级策略 JSON 不能为空。",
            },
            { status: 400 },
          )
        }

        try {
          JSON.parse(advancedJson)
        } catch {
          return HttpResponse.json(
            {
              title: "validation_error",
              detail: "高级策略 JSON 格式无效。",
            },
            { status: 400 },
          )
        }
      }

      const now = new Date().toISOString()

      state.quotasPolicy = {
        mode: mode as TenantQuotasPolicy["mode"],
        simple,
        advancedJson,
        updatedAt: now,
        updatedBy: "当前用户",
      }

      state.policyHistory.unshift(
        buildPolicyHistoryItem("quotas", "更新配额策略并同步资源池限制。", [
          "maxProjects",
          "maxServices",
          "dailyTokenLimit",
          "concurrentRequests",
          "gpuPoolQuotas",
          "mode",
        ]),
      )

      return HttpResponse.json(cloneQuotasPolicy(state.quotasPolicy))
    },
  ),
  http.put(
    "*/infera-api/tenants/:tenantId/quotas-budgets/budgets-policy",
    async ({ params, request }) => {
      await delay(360)

      const tenantId = typeof params.tenantId === "string" ? params.tenantId : ""
      const state = getStoreState(tenantId)

      if (!state.capabilities.canEditBudgets) {
        return HttpResponse.json(
          {
            title: "forbidden",
            detail: "当前角色无权限修改预算策略。",
          },
          { status: 403 },
        )
      }

      const payload = (await request.json()) as Record<string, unknown>
      const dailyBudgetCny = parseNullableNumber(payload.dailyBudgetCny)
      const monthlyBudgetCny = parseNullableNumber(payload.monthlyBudgetCny)
      const thresholds = parseThresholds(payload.alertThresholds)
      const overageAction = parseOverageAction(payload.overageAction)
      const notifyByEmail = payload.notifyByEmail === true
      const webhookUrl = parseWebhookUrl(payload.webhookUrl)

      if (
        dailyBudgetCny !== null &&
        monthlyBudgetCny !== null &&
        monthlyBudgetCny < dailyBudgetCny
      ) {
        return HttpResponse.json(
          {
            title: "validation_error",
            detail: "月预算不能小于日预算。",
          },
          { status: 400 },
        )
      }

      if (thresholds.length === 0) {
        return HttpResponse.json(
          {
            title: "validation_error",
            detail: "至少选择一个告警阈值。",
          },
          { status: 400 },
        )
      }

      if (!overageAction) {
        return HttpResponse.json(
          {
            title: "validation_error",
            detail: "超限动作无效。",
          },
          { status: 400 },
        )
      }

      if (payload.webhookUrl !== null && typeof payload.webhookUrl !== "undefined" && !webhookUrl) {
        return HttpResponse.json(
          {
            title: "validation_error",
            detail: "Webhook 地址格式无效。",
          },
          { status: 400 },
        )
      }

      const webhookSecret =
        typeof payload.webhookSecret === "string" ? payload.webhookSecret.trim() : ""
      const secretMask =
        webhookSecret.length > 0
          ? `sk_live_****_${webhookSecret.slice(Math.max(0, webhookSecret.length - 4))}`
          : state.budgetsPolicy.webhookSecretMasked

      const now = new Date().toISOString()

      state.budgetsPolicy = {
        dailyBudgetCny,
        monthlyBudgetCny,
        alertThresholds: thresholds,
        overageAction,
        notifyByEmail,
        webhookUrl,
        webhookSecretMasked: webhookUrl ? secretMask : null,
        updatedAt: now,
        updatedBy: "当前用户",
      }

      state.policyHistory.unshift(
        buildPolicyHistoryItem("budgets", "更新预算阈值与通知策略。", [
          "dailyBudgetCny",
          "monthlyBudgetCny",
          "alertThresholds",
          "overageAction",
          "notifyByEmail",
          "webhookUrl",
        ]),
      )

      return HttpResponse.json(cloneBudgetsPolicy(state.budgetsPolicy))
    },
  ),
]

mockRegistry.register(...tenantQuotasBudgetsHandlers)
