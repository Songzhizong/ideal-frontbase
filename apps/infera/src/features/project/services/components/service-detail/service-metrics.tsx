import { type ReactNode, useMemo, useState } from "react"
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  EmptyState,
  type MetricCard,
  MetricsPanel,
  type MetricsRange,
} from "@/features/shared/components"
import { Card, CardContent, CardHeader, CardTitle } from "@/packages/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/packages/ui/chart"
import type { ProjectServiceDetail, ServiceMetricPoint } from "../../types"
import { downloadCsv, formatNumber, formatPercent } from "../service-formatters"

interface ServiceMetricsTabProps {
  service: ProjectServiceDetail
}

const CHART_CONFIG = {
  primary: {
    label: "主指标",
    color: "hsl(var(--chart-1))",
  },
  secondary: {
    label: "对比指标",
    color: "hsl(var(--chart-2))",
  },
  tertiary: {
    label: "第三指标",
    color: "hsl(var(--chart-3))",
  },
  quaternary: {
    label: "第四指标",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleTimeString("zh-CN", { hour12: false, minute: "2-digit", hour: "2-digit" })
}

function sliceByRange(points: ServiceMetricPoint[], range: MetricsRange) {
  if (range === "1h") {
    return points.slice(-12)
  }
  if (range === "6h") {
    return points.slice(-72)
  }
  if (range === "24h") {
    return points.slice(-84)
  }
  return points
}

function downsampleByGranularity(points: ServiceMetricPoint[], granularity: string) {
  if (granularity === "1m" || granularity === "5m" || granularity === "auto") {
    return points
  }
  if (granularity === "1h") {
    return points.filter((_, index) => index % 12 === 0)
  }
  return points
}

export function ServiceMetricsTab({ service }: ServiceMetricsTabProps) {
  const [range, setRange] = useState<MetricsRange>("1h")
  const [granularity, setGranularity] = useState("auto")
  const [revision, setRevision] = useState("all")
  const [compareMode, setCompareMode] = useState(false)

  const filteredMetrics = useMemo(() => {
    const byRange = sliceByRange(service.metrics, range)
    return downsampleByGranularity(byRange, granularity)
  }, [granularity, range, service.metrics])

  const latest = filteredMetrics[filteredMetrics.length - 1]

  const metricCards = useMemo<MetricCard[]>(() => {
    if (!latest) {
      return []
    }
    return [
      {
        key: "success",
        label: "成功率",
        value: formatPercent(latest.successRate),
        trendTone: "positive",
      },
      {
        key: "latency",
        label: "P95 / P99",
        value: `${formatNumber(latest.p95Ms)} / ${formatNumber(latest.p99Ms)} ms`,
      },
      {
        key: "ttft",
        label: "TTFT / TPOT",
        value: `${formatNumber(latest.ttftMs)} / ${formatNumber(latest.tpotMs)} ms`,
      },
      { key: "token", label: "Tokens/sec", value: formatNumber(latest.tokensPerSec) },
      {
        key: "gpu",
        label: "GPU 利用率 / 显存",
        value: `${formatPercent(latest.gpuUtil)} / ${formatNumber(latest.gpuMemoryGb)}Gi`,
      },
      {
        key: "concurrency",
        label: "并发 / 冷启动",
        value: `${latest.concurrency} / ${latest.coldStartCount}`,
      },
    ]
  }, [latest])

  const revisionOptions = useMemo(() => {
    const options = service.revisions.map((item) => ({
      value: item.revisionId,
      label: item.revisionId,
    }))
    return [{ value: "all", label: "全部 revisions" }, ...options]
  }, [service.revisions])

  const compareSeries = useMemo(() => {
    if (!compareMode) {
      return []
    }
    return filteredMetrics.map((point) => ({
      ...point,
      qpsCompare: Number((point.qps * 0.92).toFixed(2)),
      p95Compare: Number((point.p95Ms * 1.08).toFixed(2)),
      successCompare: Number((point.successRate - 0.4).toFixed(2)),
    }))
  }, [compareMode, filteredMetrics])

  if (service.metrics.length === 0) {
    return <EmptyState title="暂无指标数据" description="服务尚未产生可观测数据，请稍后刷新。" />
  }

  return (
    <MetricsPanel
      metrics={metricCards}
      range={range}
      onRangeChange={setRange}
      granularity={granularity}
      onGranularityChange={setGranularity}
      revision={revision}
      onRevisionChange={setRevision}
      revisionOptions={revisionOptions}
      compareMode={compareMode}
      onCompareModeChange={setCompareMode}
      onExportCsv={() => {
        downloadCsv(
          `${service.name}-metrics.csv`,
          [
            "timestamp",
            "qps",
            "p95Ms",
            "p99Ms",
            "successRate",
            "errorRate",
            "ttftMs",
            "tpotMs",
            "tokensPerSec",
            "gpuUtil",
            "gpuMemoryGb",
            "concurrency",
            "coldStartCount",
            "coldStartLatencyMs",
          ],
          filteredMetrics.map((point) => [
            point.timestamp,
            point.qps,
            point.p95Ms,
            point.p99Ms,
            point.successRate,
            point.errorRate,
            point.ttftMs,
            point.tpotMs,
            point.tokensPerSec,
            point.gpuUtil,
            point.gpuMemoryGb,
            point.concurrency,
            point.coldStartCount,
            point.coldStartLatencyMs,
          ]),
        )
      }}
    >
      <MetricChartCard title="QPS" data={filteredMetrics}>
        <Line
          dataKey="qps"
          type="monotone"
          stroke="var(--color-primary)"
          strokeWidth={2.5}
          dot={false}
        />
        {compareMode ? (
          <Line
            data={compareSeries}
            dataKey="qpsCompare"
            type="monotone"
            stroke="var(--color-secondary)"
            strokeWidth={2}
            dot={false}
          />
        ) : null}
      </MetricChartCard>

      <MetricChartCard title="延迟 P95/P99" data={filteredMetrics}>
        <Line
          dataKey="p95Ms"
          type="monotone"
          stroke="var(--color-primary)"
          strokeWidth={2.5}
          dot={false}
        />
        <Line
          dataKey="p99Ms"
          type="monotone"
          stroke="var(--color-secondary)"
          strokeWidth={2.5}
          dot={false}
        />
      </MetricChartCard>

      <MetricChartCard title="成功率/错误率" data={filteredMetrics}>
        <Line
          dataKey="successRate"
          type="monotone"
          stroke="var(--color-tertiary)"
          strokeWidth={2.5}
          dot={false}
        />
        <Line
          dataKey="errorRate"
          type="monotone"
          stroke="var(--color-quaternary)"
          strokeWidth={2.5}
          dot={false}
        />
      </MetricChartCard>

      <MetricChartCard title="TTFT/TPOT" data={filteredMetrics}>
        <Line
          dataKey="ttftMs"
          type="monotone"
          stroke="var(--color-primary)"
          strokeWidth={2.5}
          dot={false}
        />
        <Line
          dataKey="tpotMs"
          type="monotone"
          stroke="var(--color-secondary)"
          strokeWidth={2.5}
          dot={false}
        />
      </MetricChartCard>

      <MetricAreaCard
        title="Tokens/sec"
        data={filteredMetrics}
        dataKey="tokensPerSec"
        color="primary"
      />

      <MetricChartCard title="GPU 利用率/显存" data={filteredMetrics}>
        <Line
          dataKey="gpuUtil"
          type="monotone"
          stroke="var(--color-primary)"
          strokeWidth={2.5}
          dot={false}
        />
        <Line
          dataKey="gpuMemoryGb"
          type="monotone"
          stroke="var(--color-secondary)"
          strokeWidth={2.5}
          dot={false}
        />
      </MetricChartCard>

      <MetricChartCard title="冷启动次数/耗时" data={filteredMetrics}>
        <Line
          dataKey="coldStartCount"
          type="monotone"
          stroke="var(--color-primary)"
          strokeWidth={2.5}
          dot={false}
        />
        <Line
          dataKey="coldStartLatencyMs"
          type="monotone"
          stroke="var(--color-secondary)"
          strokeWidth={2.5}
          dot={false}
        />
      </MetricChartCard>
    </MetricsPanel>
  )
}

function MetricChartCard({
  title,
  data,
  children,
}: {
  title: string
  data: ServiceMetricPoint[]
  children: ReactNode
}) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={CHART_CONFIG} className="h-[220px] w-full min-w-0">
          <LineChart data={data} margin={{ left: 6, right: 6, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="timestamp" tickFormatter={formatTime} minTickGap={14} />
            <YAxis />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value) => formatTime(String(value))}
                />
              }
            />
            {children}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function MetricAreaCard({
  title,
  data,
  dataKey,
  color,
}: {
  title: string
  data: ServiceMetricPoint[]
  dataKey: "tokensPerSec"
  color: "primary" | "secondary"
}) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={CHART_CONFIG} className="h-[220px] w-full min-w-0">
          <AreaChart data={data} margin={{ left: 6, right: 6, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="timestamp" tickFormatter={formatTime} minTickGap={14} />
            <YAxis />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value) => formatTime(String(value))}
                />
              }
            />
            <Area
              dataKey={dataKey}
              type="monotone"
              stroke={`var(--color-${color})`}
              fill={`var(--color-${color})`}
              fillOpacity={0.16}
              strokeWidth={2.5}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
