import type { LucideIcon } from "lucide-react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Line, LineChart, ResponsiveContainer } from "recharts"
import { BaseLink } from "@/packages/platform-router"
import { cn } from "@/packages/ui-utils"

export type MetricTone = "primary" | "info" | "success" | "warning" | "error"

export interface MetricTrend {
  value: number
  isUpward: boolean
  label: string
}

export interface MetricChartData {
  value: number
}

interface ProjectDashboardMetricCardProps {
  title: string
  value: string
  description: string
  icon: LucideIcon
  tone?: MetricTone | undefined
  to: string
  trend?: MetricTrend
  chartData?: MetricChartData[]
}

const METRIC_TONE_CLASSNAME: Readonly<Record<MetricTone, string>> = {
  primary: "border-primary/20 bg-primary/10 text-primary",
  info: "border-info/20 bg-info-subtle text-info-on-subtle",
  success: "border-success/20 bg-success-subtle text-success-on-subtle",
  warning: "border-warning/20 bg-warning-subtle text-warning-on-subtle",
  error: "border-error/20 bg-error-subtle text-error-on-subtle",
}

const METRIC_CHART_COLOR: Readonly<Record<MetricTone, string>> = {
  primary: "hsl(var(--primary))",
  info: "hsl(var(--info))",
  success: "hsl(var(--success))",
  warning: "hsl(var(--warning))",
  error: "hsl(var(--error))",
}

interface MetricCardContentProps {
  title: string
  value: string
  description: string
  icon: LucideIcon
  tone: MetricTone
  trend?: MetricTrend | undefined
  chartData?: MetricChartData[] | undefined
}

function MetricCardContent({
  title,
  value,
  description,
  icon: Icon,
  tone,
  trend,
  chartData,
}: MetricCardContentProps) {
  return (
    <div className="flex size-full flex-col justify-between space-y-4">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-transform duration-300 group-hover:scale-110",
            METRIC_TONE_CLASSNAME[tone],
          )}
        >
          <Icon className="size-5" aria-hidden />
        </div>
        {chartData && chartData.length > 0 && (
          <div className="h-10 w-24 opacity-80 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={METRIC_CHART_COLOR[tone]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">
            {title}
          </p>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-0.5 text-[10px] font-bold",
                trend.isUpward
                  ? tone === "error" || tone === "warning"
                    ? "text-error"
                    : "text-success"
                  : tone === "error" || tone === "warning"
                    ? "text-success"
                    : "text-muted-foreground",
              )}
            >
              {trend.isUpward ? (
                <TrendingUp className="size-2.5" aria-hidden />
              ) : (
                <TrendingDown className="size-2.5" aria-hidden />
              )}
              {trend.value}%
            </div>
          )}
        </div>
        <div className="flex items-baseline">
          <p className="truncate text-2xl font-bold tabular-nums tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <p className="truncate text-xs text-muted-foreground/50">{description}</p>
      </div>
    </div>
  )
}

export function ProjectDashboardMetricCard({
  title,
  value,
  description,
  icon,
  tone = "primary",
  to,
  trend,
  chartData,
}: ProjectDashboardMetricCardProps) {
  return (
    <BaseLink
      to={to}
      className="group relative flex cursor-pointer flex-col rounded-xl border border-border/50 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-border/80 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-transparent to-muted/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <MetricCardContent
        title={title}
        value={value}
        description={description}
        icon={icon}
        tone={tone}
        trend={trend}
        chartData={chartData}
      />
    </BaseLink>
  )
}
