import { useMemo, useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { EmptyState } from "@/features/shared/components"
import { Card, CardContent, CardHeader, CardTitle } from "@/packages/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/packages/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import type { FineTuningMetricPoint } from "../../types"

interface JobMetricsTabProps {
  metrics: FineTuningMetricPoint[]
}

const METRIC_CHART_CONFIG = {
  loss: {
    label: "Loss",
    color: "hsl(var(--chart-1))",
  },
  lr: {
    label: "Learning Rate",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

function formatTime(timestamp: string) {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) {
    return timestamp
  }
  return date.toLocaleTimeString("zh-CN", { hour12: false })
}

export function JobMetricsTab({ metrics }: JobMetricsTabProps) {
  const [xAxisMode, setXAxisMode] = useState<"step" | "time">("step")
  const [stepRange, setStepRange] = useState<"all" | "20" | "50" | "100">("50")

  const filteredMetrics = useMemo(() => {
    if (stepRange === "all") {
      return metrics
    }
    const limit = Number(stepRange)
    return metrics.slice(-limit)
  }, [metrics, stepRange])

  const latestMetric = filteredMetrics.at(-1)
  const firstMetric = filteredMetrics[0]

  if (metrics.length === 0) {
    return (
      <EmptyState title="暂无训练指标" description="任务尚未开始输出 Loss 曲线，请稍后刷新。" />
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 rounded-xl border border-border/50 bg-card p-4 lg:grid-cols-[1fr_auto_auto] lg:items-end">
        <div className="grid gap-2 text-sm lg:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">最新 Loss</p>
            <p className="text-xl font-semibold tabular-nums">{latestMetric?.loss ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">初始 Loss</p>
            <p className="text-xl font-semibold tabular-nums">{firstMetric?.loss ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">最新 LR</p>
            <p className="text-xl font-semibold tabular-nums">
              {latestMetric?.learningRate ?? "-"}
            </p>
          </div>
        </div>

        <Select value={xAxisMode} onValueChange={(value) => setXAxisMode(value as "step" | "time")}>
          <SelectTrigger className="w-36 cursor-pointer">
            <SelectValue placeholder="X 轴" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="step" className="cursor-pointer">
              按 Step
            </SelectItem>
            <SelectItem value="time" className="cursor-pointer">
              按时间
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={stepRange}
          onValueChange={(value) => setStepRange(value as typeof stepRange)}
        >
          <SelectTrigger className="w-36 cursor-pointer">
            <SelectValue placeholder="范围" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="20" className="cursor-pointer">
              最近 20
            </SelectItem>
            <SelectItem value="50" className="cursor-pointer">
              最近 50
            </SelectItem>
            <SelectItem value="100" className="cursor-pointer">
              最近 100
            </SelectItem>
            <SelectItem value="all" className="cursor-pointer">
              全部
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Loss 曲线</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={METRIC_CHART_CONFIG} className="h-[260px] w-full min-w-0">
              <LineChart data={filteredMetrics} margin={{ left: 6, right: 6, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey={xAxisMode === "step" ? "step" : "timestamp"}
                  tickFormatter={(value) =>
                    xAxisMode === "step" ? String(value) : formatTime(String(value))
                  }
                  minTickGap={12}
                />
                <YAxis domain={["dataMin - 0.1", "dataMax + 0.1"]} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      formatter={(value) => [Number(value).toFixed(4), "Loss"]}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="loss"
                  stroke="var(--color-loss)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Learning Rate 曲线</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={METRIC_CHART_CONFIG} className="h-[260px] w-full min-w-0">
              <LineChart data={filteredMetrics} margin={{ left: 6, right: 6, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey={xAxisMode === "step" ? "step" : "timestamp"}
                  tickFormatter={(value) =>
                    xAxisMode === "step" ? String(value) : formatTime(String(value))
                  }
                  minTickGap={12}
                />
                <YAxis />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      formatter={(value) => [Number(value).toFixed(6), "LR"]}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="learningRate"
                  stroke="var(--color-lr)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
