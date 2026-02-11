import { AlertTriangle, Boxes, Coins, RefreshCcw, Server, Waypoints } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"
import { ContentLayout } from "@/components/content-layout"
import { buildProjectPath } from "@/components/workspace/workspace-context"
import { getHttpErrorMessage } from "@/features/core/api"
import { EmptyState, ErrorState } from "@/features/shared/components"
import { isApiError } from "@/packages/error-core"
import { Badge } from "@/packages/ui/badge"
import { Button } from "@/packages/ui/button"
import { useProjectDashboardActions, useProjectDashboardQuery } from "../hooks"
import type { ProjectDashboardRange } from "../types/project-dashboard"
import {
  formatCompactInteger,
  formatCurrency,
  formatDateTime,
  formatErrorRate,
  formatInteger,
} from "../utils/project-dashboard-formatters"
import { ProjectActiveAlertsCard } from "./project-active-alerts-card"
import { ProjectDashboardLoadingState } from "./project-dashboard-loading-state"
import { ProjectDashboardMetricCard } from "./project-dashboard-metric-card"
import { ProjectRecentDeploymentsCard } from "./project-recent-deployments-card"

interface ProjectDashboardPageProps {
  tenantId: string
  projectId: string
}

const RANGE_OPTIONS: ReadonlyArray<{ value: ProjectDashboardRange; label: string }> = [
  {
    value: "1h",
    label: "最近 1h",
  },
  {
    value: "24h",
    label: "最近 24h",
  },
  {
    value: "7d",
    label: "最近 7d",
  },
]

function toErrorMessage(error: unknown) {
  if (isApiError(error)) {
    return getHttpErrorMessage(error)
  }

  if (error instanceof Error) {
    return error.message
  }

  return "操作失败，请稍后重试。"
}

export function ProjectDashboardPage({ tenantId, projectId }: ProjectDashboardPageProps) {
  const [range, setRange] = React.useState<ProjectDashboardRange>("24h")
  const dashboardQuery = useProjectDashboardQuery({
    tenantId,
    projectId,
    range,
  })
  const actions = useProjectDashboardActions({
    tenantId,
    projectId,
  })

  const dashboard = dashboardQuery.data

  const handleAckAlert = React.useCallback(
    async (alertId: string) => {
      try {
        await actions.ackAlert.mutateAsync(alertId)
      } catch (error) {
        toast.error(toErrorMessage(error))
      }
    },
    [actions.ackAlert],
  )

  const metricCards = React.useMemo(() => {
    if (!dashboard) {
      return []
    }

    // 模拟趋势数据
    const mockTrends = {
      services: { value: 12, isUpward: true, label: "较昨日" },
      models: { value: 5, isUpward: true, label: "本周" },
      cost: { value: 8.4, isUpward: true, label: "较上月" },
      tokens: { value: 24.5, isUpward: true, label: "较昨日" },
      errorRate: { value: 1.2, isUpward: false, label: "最近 24h" },
    }

    // 模拟图表数据
    const generateMockData = (base: number, volatility: number, count = 12) => {
      return Array.from({ length: count }, (_, i) => ({
        value: base + Math.sin(i * 0.5) * volatility + Math.random() * volatility,
      }))
    }

    return [
      {
        key: "services",
        title: "运行服务数",
        value: `${formatInteger(dashboard.metrics.readyServiceCount)}/${formatInteger(dashboard.metrics.totalServiceCount)}`,
        description: "Ready / Total",
        icon: Server,
        tone: "success" as const,
        to: buildProjectPath(tenantId, projectId, "/services"),
        trend: mockTrends.services,
        chartData: generateMockData(dashboard.metrics.readyServiceCount, 2),
      },
      {
        key: "models",
        title: "模型数",
        value: `${formatInteger(dashboard.metrics.modelAssetCount)}/${formatInteger(dashboard.metrics.modelVersionCount)}`,
        description: "资产数 / 版本数",
        icon: Boxes,
        tone: "info" as const,
        to: buildProjectPath(tenantId, projectId, "/models"),
        trend: mockTrends.models,
        chartData: generateMockData(dashboard.metrics.modelAssetCount, 1),
      },
      {
        key: "monthly-cost",
        title: "本月成本",
        value: formatCurrency(dashboard.metrics.monthlyEstimatedCostCny),
        description: "按当前趋势估算",
        icon: Coins,
        tone: "warning" as const,
        to: buildProjectPath(tenantId, projectId, "/usage"),
        trend: mockTrends.cost,
        chartData: generateMockData(dashboard.metrics.monthlyEstimatedCostCny / 30, 10),
      },
      {
        key: "tokens-today",
        title: "今日 Tokens",
        value: formatCompactInteger(dashboard.metrics.tokensToday),
        description: `累计 ${formatInteger(dashboard.metrics.tokensToday)}`,
        icon: Waypoints,
        tone: "primary" as const,
        to: buildProjectPath(tenantId, projectId, "/usage"),
        trend: mockTrends.tokens,
        chartData: generateMockData(
          dashboard.metrics.tokensToday / 10,
          dashboard.metrics.tokensToday / 50,
        ),
      },
      {
        key: "error-rate",
        title: "错误率",
        value: formatErrorRate(dashboard.metrics.errorRate),
        description: `${range.toUpperCase()} 请求窗口`,
        icon: AlertTriangle,
        tone: "error" as const,
        to: buildProjectPath(tenantId, projectId, "/services"),
        trend: mockTrends.errorRate,
        chartData: generateMockData(dashboard.metrics.errorRate, 0.5),
      },
    ]
  }, [dashboard, projectId, range, tenantId])

  const isEmptyDashboard =
    dashboard &&
    dashboard.metrics.totalServiceCount === 0 &&
    dashboard.metrics.modelAssetCount === 0 &&
    dashboard.metrics.monthlyEstimatedCostCny === 0 &&
    dashboard.metrics.tokensToday === 0 &&
    dashboard.recentDeployments.length === 0 &&
    dashboard.activeAlerts.length === 0 &&
    dashboard.recentAudits.length === 0

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card p-1">
        {RANGE_OPTIONS.map((option) => (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={option.value === range ? "default" : "ghost"}
            onClick={() => setRange(option.value)}
            className="cursor-pointer transition-colors duration-150"
          >
            {option.label}
          </Button>
        ))}
      </div>

      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => {
          void dashboardQuery.refetch()
        }}
        disabled={dashboardQuery.isFetching}
        className="cursor-pointer transition-colors duration-150"
      >
        <RefreshCcw
          className={dashboardQuery.isFetching ? "size-4 animate-spin" : "size-4"}
          aria-hidden
        />
        刷新
      </Button>

      {dashboard ? (
        <Badge variant="outline" className="font-mono text-xs text-muted-foreground">
          更新于 {formatDateTime(dashboard.lastUpdatedAt)}
        </Badge>
      ) : null}
    </div>
  )

  return (
    <ContentLayout
      title="项目看板"
      description="聚合展示项目服务健康、模型资产、告警与审计动态，帮助你快速识别风险并跟进处理。"
      actions={headerActions}
    >
      {dashboardQuery.isPending ? <ProjectDashboardLoadingState /> : null}

      {dashboardQuery.isError ? (
        <ErrorState
          title="项目看板加载失败"
          message="无法获取项目看板数据，请稍后重试。"
          error={dashboardQuery.error}
          onRetry={() => {
            void dashboardQuery.refetch()
          }}
        />
      ) : null}

      {!dashboardQuery.isPending && !dashboardQuery.isError && dashboard && !isEmptyDashboard ? (
        <div className="flex flex-col gap-8 pb-10">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">
                核心业务指标
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {metricCards.map((metric) => (
                <ProjectDashboardMetricCard
                  key={metric.key}
                  title={metric.title}
                  value={metric.value}
                  description={metric.description}
                  icon={metric.icon}
                  tone={metric.tone}
                  to={metric.to}
                  trend={metric.trend}
                  chartData={metric.chartData}
                />
              ))}
            </div>
          </section>

          <section className="grid items-stretch gap-8 xl:grid-cols-[1.8fr_1.2fr]">
            <div className="flex flex-col space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 px-1 text-left">
                部署动态
              </h2>
              <div className="flex-1">
                <ProjectRecentDeploymentsCard
                  tenantId={tenantId}
                  projectId={projectId}
                  deployments={dashboard.recentDeployments}
                />
              </div>
            </div>
            <div className="flex flex-col space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 px-1 text-left">
                活跃告警
              </h2>
              <div className="flex-1">
                <ProjectActiveAlertsCard
                  tenantId={tenantId}
                  projectId={projectId}
                  alerts={dashboard.activeAlerts}
                  ackLoading={actions.ackAlert.isPending}
                  onAckAlert={handleAckAlert}
                />
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {!dashboardQuery.isPending && !dashboardQuery.isError && dashboard && isEmptyDashboard ? (
        <EmptyState
          icon={Server}
          title="项目看板暂无数据"
          description="当前项目还没有产生运行数据，可先创建服务或上传模型后再查看。"
          primaryAction={{
            label: "刷新",
            onClick: () => {
              void dashboardQuery.refetch()
            },
          }}
        />
      ) : null}
    </ContentLayout>
  )
}
