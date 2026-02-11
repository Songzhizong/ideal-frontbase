import { BarChart3 } from "lucide-react"
import { useMemo } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { EmptyState } from "@/features/shared/components"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/packages/ui/chart"
import type { TenantOverviewCostPoint, TenantOverviewRange } from "../types/tenant-overview"
import { formatCompactCurrency, formatTrendDateLabel } from "../utils/tenant-overview-formatters"

interface TenantCostTrendChartProps {
  points: readonly TenantOverviewCostPoint[]
  range: TenantOverviewRange
}

const COST_TREND_CHART_CONFIG = {
  cost: {
    label: "每日成本",
    color: "hsl(var(--warning))",
  },
} satisfies ChartConfig

function formatAxisTick(value: string | number) {
  const numericValue = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(numericValue)) {
    return formatCompactCurrency(0)
  }
  return formatCompactCurrency(numericValue)
}

export function TenantCostTrendChart({ points, range }: TenantCostTrendChartProps) {
  const chartData = useMemo(() => {
    return points.map((point) => {
      // 模拟上周同期数据，带一点上下浮动以示真实感
      const comparisonFactor = range === "7d" ? 0.92 : 0.88
      const mockPrevCost = point.costCny * (comparisonFactor + (Math.random() - 0.5) * 0.05)

      return {
        label: formatTrendDateLabel(point.date, range),
        cost: point.costCny,
        prevCost: mockPrevCost,
      }
    })
  }, [points, range])

  if (chartData.length === 0) {
    return (
      <Card className="overflow-hidden border-border/60 bg-card py-0">
        <CardHeader className="space-y-2 px-6 pb-2 pt-5">
          <CardTitle className="text-base font-semibold tracking-tight">每日成本 (¥)</CardTitle>
          <CardDescription>租户整体成本变化趋势</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-2">
          <EmptyState
            icon={BarChart3}
            title="暂无成本趋势数据"
            description="当前时间范围内没有可展示的数据。"
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full overflow-hidden border-border/60 bg-card py-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 pb-2 pt-5">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold tracking-tight">
            每日成本趋势 ({range === "30d" ? "近 30 天" : "近 7 天"})
          </CardTitle>
          <CardDescription className="text-xs">租户资源消耗预估 (¥)</CardDescription>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-warning shadow-[0_0_8px_rgba(var(--warning),0.4)]" />
            <span>当前周期</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-3 border-t-2 border-dashed border-muted-foreground/30" />
            <span>上个周期</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-2">
        <ChartContainer config={COST_TREND_CHART_CONFIG} className="h-[300px] w-full min-w-0">
          <AreaChart
            data={chartData}
            margin={{
              left: 4,
              right: 8,
              top: 10,
              bottom: 4,
            }}
          >
            <defs>
              <linearGradient id="fillCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-cost)" stopOpacity={0.1} />
                <stop offset="100%" stopColor="var(--color-cost)" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              horizontal
              strokeDasharray="3 3"
              stroke="hsl(var(--muted-foreground))"
              strokeOpacity={0.15}
            />
            <XAxis
              dataKey="label"
              tickLine={{ stroke: "hsl(var(--border))" }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickMargin={10}
              minTickGap={16}
              fontSize={12}
              tick={{ fill: "hsl(var(--muted-foreground))", fontWeight: 500 }}
            />
            <YAxis
              tickFormatter={formatAxisTick}
              tickLine={false}
              axisLine={false}
              width={56}
              fontSize={11}
              tick={{ fill: "hsl(var(--muted-foreground)/0.6)", fontWeight: 600 }}
              domain={["auto", "auto"]}
              hide={chartData.length === 0}
            />
            <ChartTooltip
              cursor={{
                stroke: "hsl(var(--warning)/0.2)",
                strokeWidth: 2,
              }}
              content={
                <ChartTooltipContent
                  className="w-48 border-border/50 bg-popover/90 px-3 py-2 text-xs shadow-xl backdrop-blur-md"
                  labelFormatter={(label) => `日期: ${String(label)}`}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="prevCost"
              stroke="hsl(var(--muted-foreground)/0.3)"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="transparent"
              isAnimationActive={false}
              name="上个周期"
            />
            <Area
              type="monotone"
              dataKey="cost"
              stroke="var(--color-cost)"
              strokeWidth={3}
              fill="url(#fillCost)"
              fillOpacity={1}
              dot={{ r: 3, fill: "var(--color-cost)", strokeWidth: 0 }}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                stroke: "var(--color-cost)",
                fill: "hsl(var(--background))",
              }}
              name="当前周期"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
