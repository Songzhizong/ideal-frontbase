import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Coins,
  type LucideIcon,
} from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { useEffect, useMemo, useState } from "react"
import { cn } from "@/packages/ui-utils"
import type { TenantProjectItem } from "../types/tenant-projects"
import { formatCurrency, formatTokenCount } from "../utils/tenant-projects-formatters"

interface TenantProjectsGlobalMetricsProps {
  projects: readonly TenantProjectItem[]
}

type ValueRoundMode = "none" | "floor" | "round"

interface MetricCardItem {
  id: string
  title: string
  value: number
  formatValue: (value: number) => string
  valueRoundMode: ValueRoundMode
  caption: string
  trendPoints: readonly number[]
  delta?: number
  icon: LucideIcon
  toneClassName: string
}

function buildTrendSeries(baseValue: number, seed: number) {
  const safeBase = Math.max(baseValue, 1)

  return Array.from({ length: 6 }, (_, index) => {
    const wave = Math.sin((seed + index) * 0.63) * 0.08
    const slope = (index - 2) * 0.025
    return Math.max(0, safeBase * (0.82 + wave + slope))
  })
}

function buildSparklinePoints(values: readonly number[]) {
  if (values.length === 0) {
    return ""
  }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(max - min, 1)

  return values
    .map((value, index) => {
      const x = values.length === 1 ? 50 : (index / (values.length - 1)) * 100
      const y = 30 - ((value - min) / range) * 22
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(" ")
}

function calculateTrendDelta(values: readonly number[]) {
  if (values.length < 2) {
    return 0
  }

  const first = values[0] ?? 0
  const last = values[values.length - 1] ?? 0

  if (first <= 0) {
    return 0
  }

  return ((last - first) / first) * 100
}

function toDisplayNumber(value: number, roundMode: ValueRoundMode) {
  if (roundMode === "round") {
    return Math.round(value)
  }

  if (roundMode === "floor") {
    return Math.floor(value)
  }

  return value
}

interface AnimatedMetricValueProps {
  value: number
  formatValue: (value: number) => string
  roundMode: ValueRoundMode
  durationMs?: number
}

function AnimatedMetricValue({
  value,
  formatValue,
  roundMode,
  durationMs = 860,
}: AnimatedMetricValueProps) {
  const prefersReducedMotion = useReducedMotion()
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(value)
      return
    }

    let frame = 0
    const startAt = performance.now()

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startAt) / durationMs)
      const eased = 1 - (1 - progress) ** 3
      setDisplayValue(value * eased)

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick)
      }
    }

    frame = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [durationMs, prefersReducedMotion, value])

  const rendered = toDisplayNumber(displayValue, roundMode)
  return <span className="font-mono">{formatValue(rendered)}</span>
}

function MetricSparkline({ points }: { points: readonly number[] }) {
  const polylinePoints = buildSparklinePoints(points)

  return (
    <svg viewBox="0 0 100 34" className="h-8 w-20 text-primary/75" aria-hidden>
      <title>指标趋势波动</title>
      <motion.polyline
        points={polylinePoints}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0.5 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
    </svg>
  )
}

export function TenantProjectsGlobalMetrics({ projects }: TenantProjectsGlobalMetricsProps) {
  const totalMonthlyEstimate = projects.reduce(
    (sum, project) => sum + project.monthlyEstimatedCostCny,
    0,
  )
  const totalTokensToday = projects.reduce((sum, project) => sum + project.tokensToday, 0)
  const unhealthyProjects = projects.reduce(
    (count, project) =>
      count + (project.serviceSummary.ready < project.serviceSummary.total ? 1 : 0),
    0,
  )

  const monthlyTrend = buildTrendSeries(totalMonthlyEstimate, projects.length + 11)
  const tokenTrend = buildTrendSeries(totalTokensToday, unhealthyProjects + 29)
  const unhealthyTrend = buildTrendSeries(unhealthyProjects + 1, totalTokensToday % 31).map(
    (value) => Math.max(0, Math.round(value - 1)),
  )

  const cards = useMemo(() => {
    const monthlyDelta = calculateTrendDelta(monthlyTrend)
    const healthyCoverage =
      projects.length === 0
        ? 100
        : Math.round(((projects.length - unhealthyProjects) / projects.length) * 100)

    const nextCards: MetricCardItem[] = [
      {
        id: "budget",
        title: "总月度预算消耗趋势",
        value: totalMonthlyEstimate,
        formatValue: formatCurrency,
        valueRoundMode: "none",
        caption: "近 6 小时预算基线波动",
        trendPoints: monthlyTrend,
        delta: monthlyDelta,
        icon: Activity,
        toneClassName: "text-primary bg-primary/10 backdrop-blur-sm",
      },
      {
        id: "tokens",
        title: "全平台今日 Token 消耗",
        value: totalTokensToday,
        formatValue: formatTokenCount,
        valueRoundMode: "floor",
        caption: `覆盖 ${projects.length} 个项目`,
        trendPoints: tokenTrend,
        icon: Coins,
        toneClassName: "text-amber-500 bg-amber-500/10 backdrop-blur-sm",
      },
      {
        id: "alerts",
        title: "当前异常服务统计",
        value: unhealthyProjects,
        formatValue: (current) => `${Math.round(current)} 项`,
        valueRoundMode: "round",
        caption: `Healthy 覆盖率 ${healthyCoverage}%`,
        trendPoints: unhealthyTrend,
        icon: AlertTriangle,
        toneClassName:
          unhealthyProjects === 0
            ? "text-emerald-500 bg-emerald-500/10 backdrop-blur-sm"
            : "text-amber-600 bg-amber-500/10 backdrop-blur-sm animate-pulse-subtle",
      },
    ]

    return nextCards
  }, [
    monthlyTrend,
    projects.length,
    tokenTrend,
    totalMonthlyEstimate,
    totalTokensToday,
    unhealthyProjects,
    unhealthyTrend,
  ])

  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.08 },
        },
      }}
      className="grid grid-cols-1 gap-3 lg:grid-cols-3"
    >
      {cards.map((card) => {
        const Icon = card.icon

        return (
          <motion.article
            key={card.id}
            variants={{
              hidden: { opacity: 0, y: 12, scale: 0.98 },
              show: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="rounded-2xl border border-border/40 bg-background/40 px-4 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">{card.title}</p>
                <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                  <AnimatedMetricValue
                    value={card.value}
                    formatValue={card.formatValue}
                    roundMode={card.valueRoundMode}
                  />
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex size-9 items-center justify-center rounded-full transition-all",
                  card.toneClassName,
                  card.id === "alerts" &&
                    card.value > 0 &&
                    "animate-pulse shadow-[0_0_12px_-4px_rgba(245,158,11,0.5)]",
                )}
              >
                <Icon className="size-4" aria-hidden />
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{card.caption}</p>
              <MetricSparkline points={card.trendPoints} />
            </div>

            {typeof card.delta === "number" ? (
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                {card.delta >= 0 ? (
                  <ArrowUpRight
                    className={cn(
                      "size-3.5",
                      card.id === "alerts" ? "text-amber-500" : "text-amber-500", // Cost/Token UP = Bad/Warn
                    )}
                    aria-hidden
                  />
                ) : (
                  <ArrowDownRight
                    className={cn(
                      "size-3.5",
                      card.id === "alerts"
                        ? "text-emerald-500" // Alerts DOWN = Good
                        : "text-emerald-500", // Cost/Token DOWN = Good
                    )}
                    aria-hidden
                  />
                )}
                {Math.abs(card.delta).toFixed(1)}%
              </p>
            ) : null}
          </motion.article>
        )
      })}
    </motion.section>
  )
}
