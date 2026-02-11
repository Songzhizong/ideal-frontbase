import { subDays } from "date-fns"
import { delay, HttpResponse, http } from "msw"
import { mockRegistry } from "@/packages/mock-core"
import type {
  TenantOverviewAuditEvent,
  TenantOverviewCostPoint,
  TenantOverviewMetrics,
  TenantOverviewProjectCostItem,
  TenantOverviewRange,
  TenantOverviewResponse,
} from "../types/tenant-overview"

interface TenantOverviewSeed {
  metrics: TenantOverviewMetrics
  dailyCosts: readonly number[]
  topProjects: readonly TenantOverviewProjectCostItem[]
  recentAudits: readonly TenantOverviewAuditEvent[]
}

const TENANT_OVERVIEW_SEEDS: Readonly<Record<string, TenantOverviewSeed>> = {
  "1": {
    metrics: {
      accountBalanceCny: 186230.45,
      monthlyEstimatedCostCny: 52340.18,
      tokensToday: 98653210,
      activeProjectCount: 12,
      activeServiceCount: 27,
      totalServiceCount: 35,
      openAlertCount: 4,
    },
    dailyCosts: [
      1230, 1286, 1398, 1450, 1512, 1588, 1642, 1598, 1684, 1712, 1760, 1826, 1889, 1936, 2012,
      2098, 2140, 2192, 2236, 2310, 2405, 2478, 2522, 2586, 2631, 2705, 2760, 2826, 2898, 2960,
    ],
    topProjects: [
      {
        projectId: "project-chat",
        projectName: "Chat Gateway",
        environment: "Prod",
        monthlyEstimatedCostCny: 17230.6,
        costTrendChange: 0.12,
        tokensToday: 31245020,
        tokensTrendChange: 0.08,
        tokensSparklineData: [
          45, 52, 48, 61, 55, 67, 72, 68, 64, 78, 85, 82, 75, 78, 88, 92, 95, 88, 82, 76, 70, 65,
          58, 52,
        ],
        readyServiceCount: 6,
        totalServiceCount: 7,
      },
      {
        projectId: "project-rag",
        projectName: "RAG Platform",
        environment: "Test",
        monthlyEstimatedCostCny: 12320.12,
        costTrendChange: -0.05,
        tokensToday: 20834120,
        tokensTrendChange: 0.15,
        tokensSparklineData: [
          32, 35, 30, 38, 42, 48, 45, 40, 38, 45, 52, 55, 60, 58, 55, 52, 48, 45, 42, 38, 35, 32,
          30, 28,
        ],
        readyServiceCount: 5,
        totalServiceCount: 6,
      },
      {
        projectId: "project-eval",
        projectName: "Evaluation Hub",
        environment: "Prod",
        monthlyEstimatedCostCny: 9680.75,
        costTrendChange: 0.02,
        tokensToday: 15223090,
        tokensTrendChange: -0.03,
        tokensSparklineData: [
          20, 22, 25, 28, 30, 28, 25, 22, 20, 18, 15, 12, 10, 12, 15, 18, 20, 22, 25, 28, 30, 32,
          35, 38,
        ],
        readyServiceCount: 4,
        totalServiceCount: 4,
      },
      {
        projectId: "project-vision",
        projectName: "Vision Stack",
        environment: "Dev",
        monthlyEstimatedCostCny: 7312.48,
        costTrendChange: 0.18,
        tokensToday: 10823520,
        tokensTrendChange: 0.22,
        tokensSparklineData: [
          10, 12, 15, 18, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 110,
          120, 130,
        ],
        readyServiceCount: 3,
        totalServiceCount: 4,
      },
      {
        projectId: "project-ops",
        projectName: "Ops Assistant",
        environment: "Test",
        monthlyEstimatedCostCny: 5796.23,
        costTrendChange: -0.08,
        tokensToday: 8752190,
        tokensTrendChange: 0.05,
        tokensSparklineData: [
          15, 18, 20, 18, 15, 12, 10, 12, 15, 18, 20, 22, 25, 28, 30, 32, 35, 38, 40, 42, 45, 48,
          50, 52,
        ],
        readyServiceCount: 2,
        totalServiceCount: 3,
      },
    ],
    recentAudits: [
      {
        id: "audit-1001",
        actor: "ops-admin@acme.ai",
        action: "service.revision.deploy",
        resourceType: "service",
        resourceName: "chat-gateway-prod",
        happenedAt: "2026-02-10T09:52:00Z",
      },
      {
        id: "audit-1002",
        actor: "finops@acme.ai",
        action: "budget.policy.update",
        resourceType: "budget",
        resourceName: "tenant-monthly-budget",
        happenedAt: "2026-02-10T09:15:00Z",
      },
      {
        id: "audit-1003",
        actor: "ml-lead@acme.ai",
        action: "model.tag.promote",
        resourceType: "model",
        resourceName: "gpt-chat-v3",
        happenedAt: "2026-02-10T08:37:00Z",
      },
      {
        id: "audit-1004",
        actor: "security-bot",
        action: "api_key.revoke",
        resourceType: "api_key",
        resourceName: "partner-eu-key",
        happenedAt: "2026-02-10T07:42:00Z",
      },
      {
        id: "audit-1005",
        actor: "owner@acme.ai",
        action: "project.create",
        resourceType: "project",
        resourceName: "Evaluation Hub",
        happenedAt: "2026-02-10T06:58:00Z",
      },
    ],
  },
  "2": {
    metrics: {
      accountBalanceCny: 92315.8,
      monthlyEstimatedCostCny: 18792.36,
      tokensToday: 32871220,
      activeProjectCount: 5,
      activeServiceCount: 11,
      totalServiceCount: 14,
      openAlertCount: 1,
    },
    dailyCosts: [
      680, 702, 731, 745, 768, 792, 808, 825, 846, 869, 893, 905, 924, 942, 960, 988, 1002, 1018,
      1036, 1052, 1080, 1098, 1120, 1144, 1160, 1185, 1202, 1225, 1240, 1268,
    ],
    topProjects: [
      {
        projectId: "project-vision",
        projectName: "Vision Stack",
        environment: "Dev",
        monthlyEstimatedCostCny: 6200.4,
        tokensToday: 11234220,
        readyServiceCount: 3,
        totalServiceCount: 3,
      },
      {
        projectId: "project-eval",
        projectName: "Evaluation Hub",
        environment: "Prod",
        monthlyEstimatedCostCny: 5030.3,
        tokensToday: 9012330,
        readyServiceCount: 2,
        totalServiceCount: 3,
      },
      {
        projectId: "project-rag",
        projectName: "RAG Platform",
        environment: "Test",
        monthlyEstimatedCostCny: 3560.22,
        costTrendChange: -0.03,
        tokensToday: 6400510,
        tokensTrendChange: -0.08,
        tokensSparklineData: [
          32, 35, 30, 38, 42, 48, 45, 40, 38, 45, 52, 55, 60, 58, 55, 52, 48, 45, 42, 38, 35, 32,
          30, 28,
        ],
        readyServiceCount: 2,
        totalServiceCount: 2,
      },
      {
        projectId: "project-ops",
        projectName: "Ops Assistant",
        environment: "Test",
        monthlyEstimatedCostCny: 2410.91,
        costTrendChange: 0.08,
        tokensToday: 3520040,
        tokensTrendChange: 0.05,
        tokensSparklineData: [
          15, 18, 20, 18, 15, 12, 10, 12, 15, 18, 20, 22, 25, 28, 30, 32, 35, 38, 40, 42, 45, 48,
          50, 52,
        ],
        readyServiceCount: 1,
        totalServiceCount: 2,
      },
      {
        projectId: "project-chat",
        projectName: "Chat Gateway",
        environment: "Prod",
        monthlyEstimatedCostCny: 1590.53,
        costTrendChange: -0.02,
        tokensToday: 2704120,
        readyServiceCount: 1,
        totalServiceCount: 1,
      },
    ],
    recentAudits: [
      {
        id: "audit-2001",
        actor: "ops@nebula.ai",
        action: "service.scale.update",
        resourceType: "service",
        resourceName: "vision-gateway-test",
        happenedAt: "2026-02-10T09:26:00Z",
      },
      {
        id: "audit-2002",
        actor: "finance@nebula.ai",
        action: "invoice.export",
        resourceType: "billing",
        resourceName: "2026-01",
        happenedAt: "2026-02-10T08:45:00Z",
      },
      {
        id: "audit-2003",
        actor: "owner@nebula.ai",
        action: "member.role.update",
        resourceType: "member",
        resourceName: "qa.lead@nebula.ai",
        happenedAt: "2026-02-10T07:59:00Z",
      },
    ],
  },
}

const FALLBACK_SEED: TenantOverviewSeed = {
  metrics: {
    accountBalanceCny: null,
    monthlyEstimatedCostCny: 0,
    tokensToday: 0,
    activeProjectCount: 0,
    activeServiceCount: 0,
    totalServiceCount: 0,
    openAlertCount: 0,
  },
  dailyCosts: [],
  topProjects: [],
  recentAudits: [],
}

const DEFAULT_TENANT_OVERVIEW_SEED = TENANT_OVERVIEW_SEEDS["1"] ?? FALLBACK_SEED

function parseRange(rawValue: string | null): TenantOverviewRange {
  return rawValue === "30d" ? "30d" : "7d"
}

function buildCostTrend(
  dailyCosts: readonly number[],
  range: TenantOverviewRange,
): TenantOverviewCostPoint[] {
  const points = range === "30d" ? 30 : 7
  const normalizedCosts = dailyCosts.length > 0 ? dailyCosts : [0]
  const startIndex = Math.max(normalizedCosts.length - points, 0)
  const latestCost = normalizedCosts[normalizedCosts.length - 1] ?? 0

  return Array.from({ length: points }, (_, index) => {
    const sourceIndex = startIndex + index
    const costCny = normalizedCosts[sourceIndex] ?? latestCost

    return {
      date: subDays(new Date(), points - index - 1).toISOString(),
      costCny,
    }
  })
}

function buildOverviewResponse(
  seed: TenantOverviewSeed,
  range: TenantOverviewRange,
): TenantOverviewResponse {
  return {
    metrics: seed.metrics,
    costTrend: buildCostTrend(seed.dailyCosts, range),
    topProjects: [...seed.topProjects],
    recentAudits: [...seed.recentAudits],
  }
}

export const tenantOverviewHandlers = [
  http.get("*/infera-api/tenants/:tenantId/overview", async ({ params, request }) => {
    await delay(320)

    const url = new URL(request.url)
    const range = parseRange(url.searchParams.get("range"))
    const tenantId = typeof params.tenantId === "string" ? params.tenantId : ""
    const seed = TENANT_OVERVIEW_SEEDS[tenantId] ?? DEFAULT_TENANT_OVERVIEW_SEED

    return HttpResponse.json(buildOverviewResponse(seed, range))
  }),
]

mockRegistry.register(...tenantOverviewHandlers)
