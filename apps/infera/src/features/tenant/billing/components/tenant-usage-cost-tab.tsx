import { BarChart3, Coins, Cpu, RefreshCcw, Rocket, Wallet } from "lucide-react"
import { useMemo, useState } from "react"
import { EmptyState, ErrorState } from "@/features/shared/components"
import { useTenantBillingOverviewQuery } from "@/features/tenant/billing"
import { Button } from "@/packages/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/ui/card"
import { Progress } from "@/packages/ui/progress"
import { Skeleton } from "@/packages/ui/skeleton"
import { cn } from "@/packages/ui-utils"
import type { TenantBillingRange } from "../types/tenant-billing"
import {
  formatCurrency,
  formatDate,
  formatInteger,
  formatPercent,
  formatTokenCount,
} from "../utils/tenant-billing-formatters"
import { CostTrendChart } from "./cost-trend-chart"

interface TenantUsageCostTabProps {
  tenantId: string
}

interface UsageMetricCard {
  key: string
  title: string
  value: string
  unit?: string
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  iconClassName?: string
  progress?: number | undefined
  progressColor?: string | undefined
}

const RANGE_OPTIONS: ReadonlyArray<{ value: TenantBillingRange; label: string }> = [
  {
    value: "7d",
    label: "近 7 天",
  },
  {
    value: "30d",
    label: "近 30 天",
  },
]

function isValidDateString(value: string) {
  return Number.isFinite(new Date(value).getTime())
}

function TenantUsageCostLoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <Card key={item} className="border-border/50 py-0">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-border/50 py-0">
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-52" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-70 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

export function TenantUsageCostTab({ tenantId }: TenantUsageCostTabProps) {
  const [range, setRange] = useState<TenantBillingRange>("30d")
  const overviewQuery = useTenantBillingOverviewQuery({
    tenantId,
    range,
  })
  const overviewData = overviewQuery.data

  const metricCards = useMemo(() => {
    if (!overviewData) {
      return [] satisfies UsageMetricCard[]
    }

    return [
      {
        key: "monthly-cost",
        title: "本月已用成本",
        value: formatCurrency(overviewData.summary.monthlyCostCny).replace(/[¥,元]/g, ""),
        unit: "¥",
        description: "自然月累计（滚动估算）",
        icon: Wallet,
        iconClassName: "bg-blue-500/10 text-blue-600",
      },
      {
        key: "tokens",
        title: "本月 Tokens",
        value: formatTokenCount(overviewData.summary.tokensThisMonth).split(" ")[0] ?? "",
        unit: formatTokenCount(overviewData.summary.tokensThisMonth).split(" ")[1] || "",
        description: "Prompt + Completion",
        icon: Coins,
        iconClassName: "bg-purple-500/10 text-purple-600",
      },
      {
        key: "requests",
        title: "本月请求量",
        value: formatInteger(overviewData.summary.requestsThisMonth),
        unit: "次",
        description: "成功 + 失败请求",
        icon: Rocket,
        iconClassName: "bg-indigo-500/10 text-indigo-600",
      },
      {
        key: "gpu-hours",
        title: "GPU Hours",
        value: formatInteger(Math.round(overviewData.summary.gpuHoursThisMonth)),
        unit: "h",
        description: "GPU 在线运行时长",
        icon: Cpu,
        iconClassName: "bg-orange-500/10 text-orange-600",
      },
      {
        key: "success-rate",
        title: "请求成功率",
        value: (overviewData.summary.successRate * 100).toFixed(1),
        unit: "%",
        description: "按请求结果统计",
        icon: Rocket,
        iconClassName:
          overviewData.summary.successRate >= 0.99
            ? "bg-green-500/10 text-green-600"
            : "bg-yellow-500/10 text-yellow-600",
      },
      {
        key: "budget-usage",
        title: "预算消耗",
        value: overviewData.summary.monthlyBudgetUsageRate
          ? (overviewData.summary.monthlyBudgetUsageRate * 100).toFixed(1)
          : "未设置",
        unit: overviewData.summary.monthlyBudgetUsageRate ? "%" : "",
        description: overviewData.summary.monthlyBudgetCny
          ? `预算上限 ${formatCurrency(overviewData.summary.monthlyBudgetCny)}`
          : "请在预算策略中配置上限",
        icon: BarChart3,
        iconClassName:
          (overviewData.summary.monthlyBudgetUsageRate ?? 0) > 0.9
            ? "bg-red-500/10 text-red-600"
            : (overviewData.summary.monthlyBudgetUsageRate ?? 0) > 0.7
              ? "bg-yellow-500/10 text-yellow-600"
              : "bg-cyan-500/10 text-cyan-600",
        progress: overviewData.summary.monthlyBudgetUsageRate
          ? overviewData.summary.monthlyBudgetUsageRate * 100
          : undefined,
        progressColor:
          (overviewData.summary.monthlyBudgetUsageRate ?? 0) > 0.9
            ? "bg-red-500"
            : (overviewData.summary.monthlyBudgetUsageRate ?? 0) > 0.7
              ? "bg-yellow-500"
              : "bg-primary",
      },
    ] satisfies UsageMetricCard[]
  }, [overviewData])

  const chartData = useMemo(() => {
    if (!overviewData) {
      return []
    }

    return overviewData.costTrend.map((point, index) => ({
      label: isValidDateString(point.timestamp) ? formatDate(point.timestamp) : `D${index + 1}`,
      cost: point.costCny,
      requests: point.requests,
    }))
  }, [overviewData])

  if (overviewQuery.isPending) {
    return <TenantUsageCostLoadingState />
  }

  if (overviewQuery.isError) {
    return (
      <ErrorState
        title="租户账单概览加载失败"
        message="无法获取 Usage & Cost 数据，请稍后重试。"
        error={overviewQuery.error}
        onRetry={() => {
          void overviewQuery.refetch()
        }}
      />
    )
  }

  if (!overviewData) {
    return (
      <EmptyState
        icon={BarChart3}
        title="暂无账单概览数据"
        description="当前租户还没有可展示的账单统计数据。"
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card p-1">
          {RANGE_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={range === option.value ? "default" : "ghost"}
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

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((card) => {
          const Icon = card.icon
          return (
            <Card
              key={card.key}
              className="relative overflow-hidden border-border/50 shadow-sm transition-all hover:shadow-md"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className={cn("size-4", card.iconClassName)} aria-hidden />
              </CardHeader>
              <CardContent className="space-y-3 pb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold tabular-nums text-foreground">
                    {card.value}
                  </span>
                  {card.unit && (
                    <span className="text-sm font-medium text-muted-foreground">{card.unit}</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                  {card.progress !== undefined && (
                    <div className="mt-2 space-y-1">
                      <Progress value={card.progress} className="h-1.5" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <CostTrendChart data={chartData} />

        <Card className="border-border/50 py-0 shadow-sm">
          <CardHeader className="space-y-1 px-6 py-4">
            <CardTitle className="text-base font-semibold">成本构成</CardTitle>
            <CardDescription className="text-xs text-muted-foreground/80">
              按计费分类查看成本占比
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-6 pb-6">
            <div className="space-y-5">
              {overviewData.costComposition.map((item) => {
                const colors: Record<string, string> = {
                  "模型推理 Tokens": "bg-indigo-500",
                  "GPU 运行时": "bg-amber-500",
                  存储与网络: "bg-emerald-500",
                }
                const barColor = colors[item.category] || "bg-slate-400"

                return (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("size-2.5 rounded-full", barColor)} />
                        <span className="text-sm font-medium text-foreground/90">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-4">
                        <span className="text-sm font-semibold tabular-nums">
                          {formatCurrency(item.amountCny).replace("¥", "¥ ")}
                        </span>
                        <span className="w-10 text-right text-xs font-medium text-muted-foreground/60">
                          {formatPercent(item.ratio)}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
                      <div
                        className={cn("h-full transition-all", barColor)}
                        style={{ width: `${item.ratio * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 border-t border-border/40 pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">总计</span>
                <span className="text-lg font-semibold tabular-nums">
                  {formatCurrency(overviewData.summary.monthlyCostCny).replace("¥", "¥ ")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
