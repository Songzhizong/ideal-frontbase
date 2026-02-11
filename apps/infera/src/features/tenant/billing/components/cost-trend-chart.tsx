"use client"

import { useMemo } from "react"
import { Bar, CartesianGrid, ComposedChart, Legend, Line, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/ui/card"
import { type ChartConfig, ChartContainer } from "@/packages/ui/chart"
import { cn } from "@/packages/ui-utils"
import { formatCurrency, formatInteger } from "../utils/tenant-billing-formatters"

interface CostTrendPoint {
  label: string
  cost: number
  requests: number
}

interface CostTrendChartProps {
  data?: CostTrendPoint[]
  className?: string
}

const chartConfig = {
  cost: {
    label: "成本",
    color: "#6366F1", // Indigo 500
  },
  requests: {
    label: "请求量",
    color: "#93C5FD", // Blue 300
  },
} satisfies ChartConfig

function formatAxisCost(value: number) {
  return `¥${Math.round(value)}`
}

function formatAxisRequest(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k`
  }
  return value.toString()
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color?: string
    fill?: string
  }>
  label?: string
}

/**
 * 自定义 Tooltip 组件
 */
function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-background p-3 shadow-xl ring-1 ring-black/5">
        <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
        <div className="space-y-1.5">
          {payload.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div
                  className="size-2 rounded-full"
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                <span className="text-xs text-foreground/80">{entry.name}</span>
              </div>
              <span className="text-xs font-bold tabular-nums">
                {entry.name === "成本"
                  ? formatCurrency(entry.value)
                  : `${formatInteger(entry.value)} 次`}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}

export function CostTrendChart({ data: propData, className }: CostTrendChartProps) {
  // 使用传入的数据或生成的模拟数据
  const chartData = useMemo(() => {
    if (propData) return propData

    // 生成 30 天模拟数据
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      const baseCost = 20 + Math.random() * 80
      const monthFactor = 1 + Math.sin(i / 5) * 0.2 // 周期性波动
      return {
        label: `${date.getMonth() + 1}-${date.getDate()}`,
        cost: Number((baseCost * monthFactor).toFixed(2)),
        requests: Math.floor(baseCost * 400 * monthFactor * (0.8 + Math.random() * 0.4)),
      }
    })
  }, [propData])

  return (
    <Card className={cn("overflow-hidden border-border/50 bg-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">成本与请求趋势</CardTitle>
          <CardDescription className="text-xs">按天查看系统资源消耗与费用支出</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-4 sm:px-6">
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
            barGap={0}
          >
            <defs>
              <linearGradient id="requestsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#93C5FD" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#DBEAFE" stopOpacity={0.3} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#9CA3AF" opacity={0.2} />

            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              minTickGap={32}
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
            />

            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={false}
              tickFormatter={formatAxisCost}
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
              width={45}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tickFormatter={formatAxisRequest}
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
              width={45}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(156, 163, 175, 0.05)" }} />

            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 20, fontSize: 12 }}
            />

            <Bar
              yAxisId="right"
              dataKey="requests"
              name="请求量"
              fill="url(#requestsGradient)"
              radius={[4, 4, 0, 0]}
              barSize={24}
            />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="cost"
              name="成本"
              stroke={chartConfig.cost.color}
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 6,
                strokeWidth: 2,
                fill: "#FFFFFF",
                stroke: chartConfig.cost.color,
              }}
              animationDuration={1500}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
