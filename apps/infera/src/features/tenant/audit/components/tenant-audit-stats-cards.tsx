import type { LucideIcon } from "lucide-react"
import { ArrowUpRight, CircleAlert, FileCheck2, Shield } from "lucide-react"
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer } from "recharts"
import { Card } from "@/packages/ui/card"
import { cn } from "@/packages/ui-utils"

interface TenantAuditStatsCardsProps {
  totalLogs: number
  moduleCount: number
  sensitiveCount: number
  sensitiveRatio: number
  sensitiveModuleCount: number
  abnormalCount: number
  abnormalRatio: number
  successRate: number
}

interface TrendPoint {
  value: number
}

const percentFormatter = new Intl.NumberFormat("zh-CN", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

function formatPercent(value: number) {
  return `${percentFormatter.format(value)}%`
}

function buildTrendData(anchor: number, waveScale: number, drift: number): TrendPoint[] {
  const safeAnchor = Math.max(anchor, 1)
  return Array.from({ length: 9 }, (_, index) => {
    const wave = Math.sin((index + 1) * 0.82) * waveScale
    const slope = (index - 4) * drift
    return {
      value: Math.max(0.2, safeAnchor * (1 + wave + slope)),
    }
  })
}

function buildHourlyData(total: number): TrendPoint[] {
  const safeTotal = Math.max(total, 1)
  const base = safeTotal / 24
  return Array.from({ length: 24 }, (_, i) => {
    // Simulate a work day pattern: lower at night (0-6), peak morning (9-11), dip lunch (12-13), peak afternoon (14-17)
    const hour = i
    let factor = 0.5 // base night level
    if (hour >= 9 && hour <= 11) factor = 1.5
    else if (hour >= 14 && hour <= 17) factor = 1.4
    else if (hour >= 7 && hour <= 22) factor = 1.0

    const randomVar = 0.8 + Math.random() * 0.4 // +/- 20% random
    return {
      value: Math.max(1, base * factor * randomVar),
    }
  })
}

type CardTone = "primary" | "destructive" | "warning" | "info"

const TONE_STYLES: Readonly<
  Record<
    CardTone,
    {
      iconClassName: string
      trendClassName: string
      lineColor: string
      fillColor: string
    }
  >
> = {
  primary: {
    iconClassName: "bg-primary/10 text-primary",
    trendClassName: "text-primary",
    lineColor: "hsl(var(--primary))",
    fillColor: "hsl(var(--primary))",
  },
  info: {
    iconClassName: "bg-info/10 text-info",
    trendClassName: "text-info",
    lineColor: "hsl(var(--info))",
    fillColor: "hsl(var(--info))",
  },
  destructive: {
    iconClassName: "bg-destructive/10 text-destructive",
    trendClassName: "text-destructive",
    lineColor: "hsl(var(--destructive))",
    fillColor: "hsl(var(--destructive))",
  },
  warning: {
    iconClassName: "bg-warning/10 text-warning",
    trendClassName: "text-warning",
    lineColor: "hsl(var(--warning))",
    fillColor: "hsl(var(--warning))",
  },
}

interface StatsCardItemProps {
  title: string
  value: string
  subtitle: string
  trendText: string
  icon: LucideIcon
  tone: CardTone
  chartData: TrendPoint[]
  chartType?: "area" | "bar"
}

function StatsCardItem({
  title,
  value,
  subtitle,
  trendText,
  icon: Icon,
  tone,
  chartData,
  chartType = "area",
}: StatsCardItemProps) {
  const toneStyles = TONE_STYLES[tone]
  const gradientId = `gradient-${tone}`

  return (
    <Card className="group rounded-2xl border-border p-4 shadow-sm transition-shadow duration-300 hover:shadow-md">
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="tabular-nums text-2xl font-semibold tracking-tight text-foreground">
              {value}
            </h3>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              toneStyles.iconClassName,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <p
            className={cn(
              "flex items-center gap-1 text-sm font-semibold leading-none",
              toneStyles.trendClassName,
            )}
          >
            <ArrowUpRight className="h-4 w-4" />
            {trendText}
          </p>
          <div className="h-7 min-w-0 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart data={chartData}>
                  <Bar
                    dataKey="value"
                    fill={toneStyles.lineColor}
                    radius={[1, 1, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              ) : (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={toneStyles.fillColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={toneStyles.fillColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={toneStyles.lineColor}
                    strokeWidth={2}
                    fill={`url(#${gradientId})`}
                    isAnimationActive={false}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  )
}

export function TenantAuditStatsCards({
  totalLogs,
  moduleCount,
  sensitiveCount,
  sensitiveRatio,
  abnormalCount,
  abnormalRatio,
  successRate,
}: TenantAuditStatsCardsProps) {
  const totalTrendData = buildHourlyData(totalLogs)
  const sensitiveTrendData = buildTrendData(sensitiveCount === 0 ? 1 : sensitiveCount, 0.1, 0.016)
  const abnormalTrendData = buildTrendData(abnormalCount === 0 ? 1 : abnormalCount, 0.08, 0.012)

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <StatsCardItem
        title="今日操作总数"
        value={totalLogs.toLocaleString("zh-CN")}
        subtitle={`覆盖 ${moduleCount} 个核心模块`}
        trendText={formatPercent((sensitiveRatio + abnormalRatio) / 2)}
        icon={FileCheck2}
        tone="info"
        chartData={totalTrendData}
        chartType="bar"
      />
      <StatsCardItem
        title="高危敏感行为"
        value={sensitiveCount.toLocaleString("zh-CN")}
        subtitle={"触发安全审计报警"}
        trendText={formatPercent(sensitiveRatio)}
        icon={Shield}
        tone="destructive"
        chartData={sensitiveTrendData}
      />
      <StatsCardItem
        title="异常请求统计"
        value={abnormalCount.toLocaleString("zh-CN")}
        subtitle={`当前服务健康率 ${formatPercent(successRate)}`}
        trendText={formatPercent(abnormalRatio)}
        icon={CircleAlert}
        tone="warning"
        chartData={abnormalTrendData}
      />
    </section>
  )
}
