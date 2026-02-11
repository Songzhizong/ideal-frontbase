import { delay, HttpResponse, http } from "msw"
import { mockRegistry } from "@/packages/mock-core"
import type {
  ProjectDashboardAlertItem,
  ProjectDashboardAuditEvent,
  ProjectDashboardDeploymentItem,
  ProjectDashboardMetrics,
  ProjectDashboardRange,
  ProjectDashboardResponse,
} from "../types/project-dashboard"

interface ProjectDashboardSeed {
  lastUpdatedAt: string
  metrics: Omit<ProjectDashboardMetrics, "errorRate"> & {
    errorRateByRange: Record<ProjectDashboardRange, number>
  }
  recentDeployments: ProjectDashboardDeploymentItem[]
  activeAlerts: ProjectDashboardAlertItem[]
  recentAudits: ProjectDashboardAuditEvent[]
}

type ProjectSeedMap = Record<string, ProjectDashboardSeed>

const PROJECT_DASHBOARD_SEEDS: ProjectSeedMap = {
  "1:project-chat": {
    lastUpdatedAt: "2026-02-10T09:58:00Z",
    metrics: {
      readyServiceCount: 8,
      totalServiceCount: 9,
      modelAssetCount: 18,
      modelVersionCount: 64,
      monthlyEstimatedCostCny: 23890.36,
      tokensToday: 34892034,
      errorRateByRange: {
        "1h": 1.86,
        "24h": 1.12,
        "7d": 0.93,
      },
    },
    recentDeployments: [
      {
        id: "dep-chat-001",
        serviceName: "chat-gateway-prod",
        serviceId: "svc-chat-gateway-prod",
        revisionId: "rev_20260210_0910",
        operator: "ml-lead@acme.ai",
        deployedAt: "2026-02-10T09:10:00Z",
        result: "Succeeded",
      },
      {
        id: "dep-chat-002",
        serviceName: "chat-rerank-prod",
        serviceId: "svc-chat-rerank-prod",
        revisionId: "rev_20260210_0832",
        operator: "ops-admin@acme.ai",
        deployedAt: "2026-02-10T08:32:00Z",
        result: "RollingBack",
      },
      {
        id: "dep-chat-003",
        serviceName: "chat-embedding-prod",
        serviceId: "svc-chat-embedding-prod",
        revisionId: "rev_20260210_0746",
        operator: "sre@acme.ai",
        deployedAt: "2026-02-10T07:46:00Z",
        result: "Failed",
      },
      {
        id: "dep-chat-004",
        serviceName: "chat-function-call",
        serviceId: "svc-chat-fn-prod",
        revisionId: "rev_20260210_0621",
        operator: "release-bot",
        deployedAt: "2026-02-10T06:21:00Z",
        result: "Succeeded",
      },
    ],
    activeAlerts: [
      {
        alertId: "alert-chat-001",
        name: "chat-gateway-prod 错误率持续升高",
        severity: "High",
        status: "Open",
        resourceType: "Service",
        resourceName: "chat-gateway-prod",
        triggeredAt: "2026-02-10T09:35:00Z",
        summary: "近 15 分钟错误率超过 2%，高于策略阈值 1.2%。",
      },
      {
        alertId: "alert-chat-002",
        name: "chat-rerank-prod P95 延迟抖动",
        severity: "Medium",
        status: "Open",
        resourceType: "Service",
        resourceName: "chat-rerank-prod",
        triggeredAt: "2026-02-10T08:48:00Z",
        summary: "P95 延迟 1.42s，超过阈值 1.0s，疑似模型切换影响。",
      },
    ],
    recentAudits: [
      {
        id: "audit-chat-1001",
        actor: "ops-admin@acme.ai",
        action: "service.revision.deploy",
        resourceType: "service",
        resourceName: "chat-gateway-prod",
        happenedAt: "2026-02-10T09:10:00Z",
      },
      {
        id: "audit-chat-1002",
        actor: "ml-lead@acme.ai",
        action: "model.tag.promote",
        resourceType: "model",
        resourceName: "chat-gpt-v4",
        happenedAt: "2026-02-10T08:27:00Z",
      },
      {
        id: "audit-chat-1003",
        actor: "release-bot",
        action: "service.traffic.update",
        resourceType: "service",
        resourceName: "chat-rerank-prod",
        happenedAt: "2026-02-10T07:43:00Z",
      },
      {
        id: "audit-chat-1004",
        actor: "owner@acme.ai",
        action: "api_key.rotate",
        resourceType: "api_key",
        resourceName: "chat-partner-key",
        happenedAt: "2026-02-10T06:54:00Z",
      },
    ],
  },
  "2:project-vision": {
    lastUpdatedAt: "2026-02-10T09:50:00Z",
    metrics: {
      readyServiceCount: 3,
      totalServiceCount: 4,
      modelAssetCount: 9,
      modelVersionCount: 27,
      monthlyEstimatedCostCny: 9321.14,
      tokensToday: 12860304,
      errorRateByRange: {
        "1h": 0.71,
        "24h": 0.58,
        "7d": 0.64,
      },
    },
    recentDeployments: [
      {
        id: "dep-vis-001",
        serviceName: "vision-gateway-test",
        serviceId: "svc-vision-gateway-test",
        revisionId: "rev_20260210_0915",
        operator: "qa.lead@nebula.ai",
        deployedAt: "2026-02-10T09:15:00Z",
        result: "Succeeded",
      },
      {
        id: "dep-vis-002",
        serviceName: "vision-ocr-test",
        serviceId: "svc-vision-ocr-test",
        revisionId: "rev_20260210_0738",
        operator: "mlops@nebula.ai",
        deployedAt: "2026-02-10T07:38:00Z",
        result: "Succeeded",
      },
    ],
    activeAlerts: [
      {
        alertId: "alert-vis-001",
        name: "vision-gateway-test 实例冷启动耗时偏高",
        severity: "Low",
        status: "Open",
        resourceType: "Service",
        resourceName: "vision-gateway-test",
        triggeredAt: "2026-02-10T09:20:00Z",
        summary: "最近 30 分钟平均冷启动耗时 46s，超过阈值 35s。",
      },
    ],
    recentAudits: [
      {
        id: "audit-vis-1001",
        actor: "owner@nebula.ai",
        action: "service.scale.update",
        resourceType: "service",
        resourceName: "vision-gateway-test",
        happenedAt: "2026-02-10T09:01:00Z",
      },
      {
        id: "audit-vis-1002",
        actor: "mlops@nebula.ai",
        action: "dataset.version.upload",
        resourceType: "dataset",
        resourceName: "vision-eval-set-v3",
        happenedAt: "2026-02-10T07:06:00Z",
      },
    ],
  },
}

const FALLBACK_SEED: ProjectDashboardSeed = {
  lastUpdatedAt: "2026-02-10T09:00:00Z",
  metrics: {
    readyServiceCount: 0,
    totalServiceCount: 0,
    modelAssetCount: 0,
    modelVersionCount: 0,
    monthlyEstimatedCostCny: 0,
    tokensToday: 0,
    errorRateByRange: {
      "1h": 0,
      "24h": 0,
      "7d": 0,
    },
  },
  recentDeployments: [],
  activeAlerts: [],
  recentAudits: [],
}

const DEFAULT_PROJECT_DASHBOARD_SEED = PROJECT_DASHBOARD_SEEDS["1:project-chat"] ?? FALLBACK_SEED

function parseRange(rawValue: string | null): ProjectDashboardRange {
  if (rawValue === "1h") {
    return "1h"
  }
  if (rawValue === "7d") {
    return "7d"
  }
  return "24h"
}

function cloneSeed(seed: ProjectDashboardSeed): ProjectDashboardSeed {
  return {
    lastUpdatedAt: seed.lastUpdatedAt,
    metrics: {
      readyServiceCount: seed.metrics.readyServiceCount,
      totalServiceCount: seed.metrics.totalServiceCount,
      modelAssetCount: seed.metrics.modelAssetCount,
      modelVersionCount: seed.metrics.modelVersionCount,
      monthlyEstimatedCostCny: seed.metrics.monthlyEstimatedCostCny,
      tokensToday: seed.metrics.tokensToday,
      errorRateByRange: {
        "1h": seed.metrics.errorRateByRange["1h"],
        "24h": seed.metrics.errorRateByRange["24h"],
        "7d": seed.metrics.errorRateByRange["7d"],
      },
    },
    recentDeployments: [...seed.recentDeployments],
    activeAlerts: [...seed.activeAlerts],
    recentAudits: [...seed.recentAudits],
  }
}

const dashboardState = new Map<string, ProjectDashboardSeed>(
  Object.entries(PROJECT_DASHBOARD_SEEDS).map(([key, seed]) => [key, cloneSeed(seed)]),
)

function buildDashboardResponse(
  seed: ProjectDashboardSeed,
  range: ProjectDashboardRange,
): ProjectDashboardResponse {
  return {
    lastUpdatedAt: seed.lastUpdatedAt,
    metrics: {
      readyServiceCount: seed.metrics.readyServiceCount,
      totalServiceCount: seed.metrics.totalServiceCount,
      modelAssetCount: seed.metrics.modelAssetCount,
      modelVersionCount: seed.metrics.modelVersionCount,
      monthlyEstimatedCostCny: seed.metrics.monthlyEstimatedCostCny,
      tokensToday: seed.metrics.tokensToday,
      errorRate: seed.metrics.errorRateByRange[range],
    },
    recentDeployments: [...seed.recentDeployments],
    activeAlerts: [...seed.activeAlerts],
    recentAudits: [...seed.recentAudits],
  }
}

function resolveSeed(tenantId: string, projectId: string) {
  const key = `${tenantId}:${projectId}`
  const seed = dashboardState.get(key)

  if (seed) {
    return {
      key,
      seed,
    }
  }

  const fallbackSeed = cloneSeed(DEFAULT_PROJECT_DASHBOARD_SEED)
  dashboardState.set(key, fallbackSeed)

  return {
    key,
    seed: fallbackSeed,
  }
}

export const projectDashboardHandlers = [
  http.get(
    "*/infera-api/tenants/:tenantId/projects/:projectId/dashboard",
    async ({ params, request }) => {
      await delay(260)

      const tenantId = typeof params.tenantId === "string" ? params.tenantId : ""
      const projectId = typeof params.projectId === "string" ? params.projectId : ""
      const url = new URL(request.url)
      const range = parseRange(url.searchParams.get("range"))

      const { seed } = resolveSeed(tenantId, projectId)

      return HttpResponse.json(buildDashboardResponse(seed, range))
    },
  ),
  http.post(
    "*/infera-api/tenants/:tenantId/projects/:projectId/dashboard/alerts/:alertId/ack",
    async ({ params }) => {
      await delay(180)

      const tenantId = typeof params.tenantId === "string" ? params.tenantId : ""
      const projectId = typeof params.projectId === "string" ? params.projectId : ""
      const alertId = typeof params.alertId === "string" ? params.alertId : ""

      const { seed } = resolveSeed(tenantId, projectId)
      const alertIndex = seed.activeAlerts.findIndex((item) => item.alertId === alertId)

      if (alertIndex === -1) {
        return HttpResponse.json(
          {
            type: "resource_not_found",
            title: "Alert not found",
          },
          {
            status: 404,
          },
        )
      }

      const [ackedAlert] = seed.activeAlerts.splice(alertIndex, 1)

      if (ackedAlert) {
        seed.recentAudits.unshift({
          id: `audit-${Date.now()}`,
          actor: "current-user@mock.local",
          action: "alert.ack",
          resourceType: "alert",
          resourceName: ackedAlert.name,
          happenedAt: new Date().toISOString(),
        })
      }

      seed.lastUpdatedAt = new Date().toISOString()

      return new HttpResponse(null, {
        status: 204,
      })
    },
  ),
]

mockRegistry.register(...projectDashboardHandlers)
