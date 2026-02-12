import { AlertTriangle, Coins, FolderKanban, RefreshCcw, Server } from "lucide-react"
import * as React from "react"
import { EmptyState, ErrorState } from "@/features/shared/components"
import {
  TenantOverviewLoadingState,
  TenantOverviewMetricCard,
  TenantTopProjectsTable,
  useTenantOverviewQuery,
} from "@/features/tenant/overview"
import { ContentLayout } from "@/packages/layout-core"
import { Button } from "@/packages/ui/button"
import type { TenantOverviewRange } from "../types/tenant-overview"
import { formatCurrency, formatInteger } from "../utils/tenant-overview-formatters"
import { TenantCostTrendChart } from "./tenant-cost-trend-chart"
import { TenantRecentAuditList } from "./tenant-recent-audit-list"

interface TenantOverviewPageProps {
  tenantId: string
}

interface MetricCardItem {
  key: string
  title: string
  value: string
  description: string
  tone?: "primary" | "info" | "success" | "warning" | "error" | undefined
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  unit?: string
  onClick?: (() => void) | undefined
}

const RANGE_OPTIONS: ReadonlyArray<{ value: TenantOverviewRange; label: string }> = [
  {
    value: "7d",
    label: "近 7 天",
  },
  {
    value: "30d",
    label: "近 30 天",
  },
]

export function TenantOverviewPage({ tenantId }: TenantOverviewPageProps) {
  const [range, setRange] = React.useState<TenantOverviewRange>("7d")
  const overviewQuery = useTenantOverviewQuery({
    tenantId,
    range,
  })
  const overviewData = overviewQuery.data

  const metricCards = React.useMemo(() => {
    if (!overviewData) {
      return [] satisfies MetricCardItem[]
    }
    const totalServiceCount = overviewData.metrics.totalServiceCount

    return [
      {
        key: "monthly-cost",
        title: "本月预估成本",
        value: formatCurrency(overviewData.metrics.monthlyEstimatedCostCny),
        description: "按当前用量滚动估算",
        tone: "warning",
        icon: Coins,
      },
      {
        key: "active-projects",
        title: "活跃项目数",
        value: formatInteger(overviewData.metrics.activeProjectCount),
        description: "过去 24h 有调用的项目",
        tone: "info",
        icon: FolderKanban,
        unit: "个",
      },
      {
        key: "active-services",
        title: "在线服务",
        value: formatInteger(overviewData.metrics.activeServiceCount),
        description:
          typeof totalServiceCount === "number"
            ? `总服务数 ${formatInteger(totalServiceCount)}`
            : "总服务数 --",
        tone: "success",
        icon: Server,
        unit: "个",
      },
      {
        key: "open-alerts",
        title: "未处理告警",
        value: formatInteger(overviewData.metrics.openAlertCount),
        description: "待确认或处理中",
        tone: "error",
        icon: AlertTriangle,
        unit: "项",
        onClick: () => {
          console.log("Navigate to alerts")
        },
      },
    ] satisfies MetricCardItem[]
  }, [overviewData])

  const actions = (
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
          void overviewQuery.refetch()
        }}
        disabled={overviewQuery.isFetching}
        className="cursor-pointer transition-colors duration-150"
      >
        <RefreshCcw
          className={overviewQuery.isFetching ? "size-4 animate-spin" : "size-4"}
          aria-hidden
        />
        刷新
      </Button>
    </div>
  )

  return (
    <ContentLayout
      title="租户概览"
      description="聚合展示租户成本、资源活跃度与近期审计操作，帮助快速定位异常。"
      actions={actions}
    >
      {overviewQuery.isPending ? <TenantOverviewLoadingState /> : null}

      {overviewQuery.isError ? (
        <ErrorState
          title="租户概览加载失败"
          message="无法获取租户概览数据，请稍后重试。"
          error={overviewQuery.error}
          onRetry={() => {
            void overviewQuery.refetch()
          }}
        />
      ) : null}

      {!overviewQuery.isPending &&
      !overviewQuery.isError &&
      overviewData &&
      metricCards.length > 0 ? (
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((card) => (
              <TenantOverviewMetricCard
                key={card.key}
                title={card.title}
                value={
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold tracking-tight">{card.value}</span>
                    {card.unit && (
                      <span className="text-xs font-semibold text-muted-foreground/50">
                        {card.unit}
                      </span>
                    )}
                  </div>
                }
                description={card.description}
                tone={card.tone}
                icon={card.icon}
                onClick={card.onClick}
              />
            ))}
          </section>

          <section className="grid items-stretch gap-6 lg:grid-cols-2">
            <TenantCostTrendChart points={overviewData.costTrend} range={range} />
            <TenantTopProjectsTable tenantId={tenantId} projects={overviewData.topProjects} />
          </section>

          <TenantRecentAuditList tenantId={tenantId} events={overviewData.recentAudits} />
        </div>
      ) : null}

      {!overviewQuery.isPending &&
      !overviewQuery.isError &&
      (!overviewData || metricCards.length === 0) ? (
        <EmptyState
          icon={FolderKanban}
          title="暂无租户概览数据"
          description="当前租户尚未产生可展示的数据，稍后可重新刷新查看。"
          primaryAction={{
            label: "立即刷新",
            onClick: () => {
              void overviewQuery.refetch()
            },
          }}
        />
      ) : null}
    </ContentLayout>
  )
}
