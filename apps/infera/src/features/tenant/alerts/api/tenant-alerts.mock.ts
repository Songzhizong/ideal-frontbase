import { delay, HttpResponse, http } from "msw"
import { mockRegistry } from "@/packages/mock-core"
import type {
  TenantActiveAlertItem,
  TenantAlertCondition,
  TenantAlertEvent,
  TenantAlertHistoryItem,
  TenantAlertRuleItem,
  UpsertTenantAlertRulePayload,
} from "../types/tenant-alerts"
import { TENANT_ALERTS_SEEDS, type TenantAlertsSeed } from "./tenant-alerts.mock.seed"

interface TenantAlertsStoreState {
  activeAlerts: TenantActiveAlertItem[]
  rules: TenantAlertRuleItem[]
  history: TenantAlertHistoryItem[]
  projectOptions: TenantAlertsSeed["projectOptions"]
  serviceOptions: TenantAlertsSeed["serviceOptions"]
}

const tenantAlertsStore = new Map<string, TenantAlertsStoreState>()

function resolveDefaultSeed(): TenantAlertsSeed {
  const seed = TENANT_ALERTS_SEEDS["1"]
  if (!seed) {
    throw new Error("Missing tenant alerts default seed.")
  }
  return seed
}
const DEFAULT_SEED = resolveDefaultSeed()

function cloneState(seed: TenantAlertsSeed): TenantAlertsStoreState {
  return {
    activeAlerts: seed.activeAlerts.map((item) => ({ ...item })),
    rules: seed.rules.map((item) => ({ ...item, condition: { ...item.condition } })),
    history: seed.history.map((item) => ({ ...item })),
    projectOptions: seed.projectOptions.map((item) => ({ ...item })),
    serviceOptions: seed.serviceOptions.map((item) => ({ ...item })),
  }
}

function getStoreState(tenantId: string): TenantAlertsStoreState {
  let state = tenantAlertsStore.get(tenantId)
  if (!state) {
    const seed = TENANT_ALERTS_SEEDS[tenantId] ?? DEFAULT_SEED
    state = cloneState(seed)
    tenantAlertsStore.set(tenantId, state)
  }
  return state
}

function nowIsoString() {
  return new Date().toISOString()
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function resolveScopeLabel(state: TenantAlertsStoreState, payload: UpsertTenantAlertRulePayload) {
  if (payload.scopeMode === "all_tenant") {
    return "全租户"
  }

  if (payload.scopeMode === "projects") {
    const projectNames = state.projectOptions
      .filter((project) => payload.projectIds.includes(project.projectId))
      .map((project) => project.projectName)

    return `指定项目 (${projectNames.join(" / ") || "未选择"})`
  }

  const serviceNames = state.serviceOptions
    .filter((service) => payload.serviceIds.includes(service.serviceId))
    .map((service) => service.serviceName)

  return `指定服务 (${serviceNames.join(" / ") || "未选择"})`
}

function buildHistoryEntry(
  alertId: string,
  type: TenantAlertRuleItem["type"],
  scopeName: string,
  event: TenantAlertEvent,
  actor: string,
  detail: string,
  status: TenantAlertHistoryItem["status"],
): TenantAlertHistoryItem {
  return {
    historyId: createId("hist"),
    alertId,
    event,
    type,
    scopeName,
    status,
    happenedAt: nowIsoString(),
    actor,
    detail,
  }
}

function appendRuleHistory(
  state: TenantAlertsStoreState,
  rule: TenantAlertRuleItem,
  detail: string,
) {
  state.history.unshift(
    buildHistoryEntry(
      rule.ruleId,
      rule.type,
      rule.scopeLabel,
      "Triggered",
      "system",
      detail,
      "Open",
    ),
  )
}

function parseRulePayload(json: unknown): UpsertTenantAlertRulePayload {
  const body = json as Partial<UpsertTenantAlertRulePayload>
  const condition = body.condition as Partial<TenantAlertCondition> | undefined

  return {
    name: String(body.name ?? "新规则"),
    type: (body.type ?? "error_rate") as UpsertTenantAlertRulePayload["type"],
    scopeMode: (body.scopeMode ?? "all_tenant") as UpsertTenantAlertRulePayload["scopeMode"],
    projectIds: Array.isArray(body.projectIds)
      ? body.projectIds.filter((value): value is string => typeof value === "string")
      : [],
    serviceIds: Array.isArray(body.serviceIds)
      ? body.serviceIds.filter((value): value is string => typeof value === "string")
      : [],
    condition: {
      metric: String(condition?.metric ?? "http_5xx_rate"),
      operator: condition?.operator === ">=" ? ">=" : ">",
      threshold: Number(condition?.threshold ?? 0),
      unit: String(condition?.unit ?? "%"),
      durationMinutes: Number(condition?.durationMinutes ?? 5),
    },
    channels: Array.isArray(body.channels)
      ? body.channels.filter(
          (value): value is "Email" | "Webhook" => value === "Email" || value === "Webhook",
        )
      : ["Email"],
    webhookUrl: typeof body.webhookUrl === "string" ? body.webhookUrl : null,
    overageAction:
      body.overageAction === "alert_only" || body.overageAction === "block_inference"
        ? body.overageAction
        : null,
    enabled: Boolean(body.enabled ?? true),
  }
}

export const tenantAlertsHandlers = [
  http.get("*/infera-api/tenants/:tenantId/alerts/active", async ({ params, request }) => {
    await delay(240)
    const tenantId = params.tenantId as string
    const state = getStoreState(tenantId)

    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const type = url.searchParams.get("type")

    const items = state.activeAlerts.filter((alert) => {
      if (status && alert.status !== status) {
        return false
      }
      if (type && alert.type !== type) {
        return false
      }
      return true
    })

    return HttpResponse.json({
      items,
    })
  }),

  http.post("*/infera-api/tenants/:tenantId/alerts/:alertId/ack", async ({ params }) => {
    await delay(220)
    const tenantId = params.tenantId as string
    const alertId = params.alertId as string
    const state = getStoreState(tenantId)

    const alert = state.activeAlerts.find((item) => item.alertId === alertId)
    if (!alert) {
      return HttpResponse.json(
        {
          message: "告警不存在",
        },
        {
          status: 404,
        },
      )
    }

    alert.status = "Ack"
    state.history.unshift(
      buildHistoryEntry(
        alert.alertId,
        alert.type,
        alert.scopeName,
        "Acked",
        "current.user@mock.ai",
        "告警已确认，等待进一步处理。",
        "Ack",
      ),
    )

    return HttpResponse.json({ success: true })
  }),

  http.get("*/infera-api/tenants/:tenantId/alerts/rules", async ({ params }) => {
    await delay(260)
    const tenantId = params.tenantId as string
    const state = getStoreState(tenantId)

    return HttpResponse.json({
      items: state.rules,
      projectOptions: state.projectOptions,
      serviceOptions: state.serviceOptions,
    })
  }),

  http.post("*/infera-api/tenants/:tenantId/alerts/rules", async ({ params, request }) => {
    await delay(300)
    const tenantId = params.tenantId as string
    const state = getStoreState(tenantId)
    const payload = parseRulePayload(await request.json())

    const rule: TenantAlertRuleItem = {
      ruleId: createId("rule"),
      ...payload,
      scopeLabel: resolveScopeLabel(state, payload),
      updatedAt: nowIsoString(),
      updatedBy: "current.user@mock.ai",
    }

    state.rules.unshift(rule)
    appendRuleHistory(state, rule, `规则「${rule.name}」已创建并生效。`)

    return HttpResponse.json(rule, {
      status: 201,
    })
  }),

  http.put("*/infera-api/tenants/:tenantId/alerts/rules/:ruleId", async ({ params, request }) => {
    await delay(300)
    const tenantId = params.tenantId as string
    const ruleId = params.ruleId as string
    const state = getStoreState(tenantId)
    const payload = parseRulePayload(await request.json())

    const currentIndex = state.rules.findIndex((rule) => rule.ruleId === ruleId)
    if (currentIndex < 0) {
      return HttpResponse.json(
        {
          message: "规则不存在",
        },
        {
          status: 404,
        },
      )
    }

    const existing = state.rules[currentIndex]
    if (!existing) {
      return HttpResponse.json(
        {
          message: "规则不存在",
        },
        {
          status: 404,
        },
      )
    }

    const nextRule: TenantAlertRuleItem = {
      ...existing,
      ...payload,
      scopeLabel: resolveScopeLabel(state, payload),
      updatedAt: nowIsoString(),
      updatedBy: "current.user@mock.ai",
    }

    state.rules[currentIndex] = nextRule
    appendRuleHistory(state, nextRule, `规则「${nextRule.name}」已更新。`)

    return HttpResponse.json(nextRule)
  }),

  http.patch(
    "*/infera-api/tenants/:tenantId/alerts/rules/:ruleId/enabled",
    async ({ params, request }) => {
      await delay(220)
      const tenantId = params.tenantId as string
      const ruleId = params.ruleId as string
      const state = getStoreState(tenantId)
      const body = (await request.json()) as { enabled?: unknown }
      const enabled = Boolean(body.enabled)

      const rule = state.rules.find((item) => item.ruleId === ruleId)
      if (!rule) {
        return HttpResponse.json(
          {
            message: "规则不存在",
          },
          {
            status: 404,
          },
        )
      }

      rule.enabled = enabled
      rule.updatedAt = nowIsoString()
      rule.updatedBy = "current.user@mock.ai"
      state.history.unshift(
        buildHistoryEntry(
          rule.ruleId,
          rule.type,
          rule.scopeLabel,
          enabled ? "Triggered" : "Resolved",
          "current.user@mock.ai",
          enabled ? `规则「${rule.name}」已启用。` : `规则「${rule.name}」已禁用。`,
          enabled ? "Open" : "Resolved",
        ),
      )

      return HttpResponse.json(rule)
    },
  ),

  http.delete("*/infera-api/tenants/:tenantId/alerts/rules/:ruleId", async ({ params }) => {
    await delay(220)
    const tenantId = params.tenantId as string
    const ruleId = params.ruleId as string
    const state = getStoreState(tenantId)
    const removedRule = state.rules.find((rule) => rule.ruleId === ruleId)

    state.rules = state.rules.filter((rule) => rule.ruleId !== ruleId)

    if (removedRule) {
      state.history.unshift(
        buildHistoryEntry(
          removedRule.ruleId,
          removedRule.type,
          removedRule.scopeLabel,
          "Resolved",
          "current.user@mock.ai",
          `规则「${removedRule.name}」已删除。`,
          "Resolved",
        ),
      )
    }

    return new HttpResponse(null, {
      status: 204,
    })
  }),

  http.get("*/infera-api/tenants/:tenantId/alerts/history", async ({ params, request }) => {
    await delay(240)
    const tenantId = params.tenantId as string
    const state = getStoreState(tenantId)
    const url = new URL(request.url)

    const event = url.searchParams.get("event")
    const type = url.searchParams.get("type")
    const status = url.searchParams.get("status")

    const items = state.history.filter((item) => {
      if (event && item.event !== event) {
        return false
      }
      if (type && item.type !== type) {
        return false
      }
      if (status && item.status !== status) {
        return false
      }
      return true
    })

    return HttpResponse.json({
      items,
    })
  }),
]

mockRegistry.register(...tenantAlertsHandlers)
