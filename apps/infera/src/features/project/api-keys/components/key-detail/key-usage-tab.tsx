import { useMemo, useState } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import { EmptyState } from "@/features/shared/components"
import { Button } from "@/packages/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/packages/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/packages/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import type { ApiKeyUsageRange, ProjectApiKeyDetail } from "../../types"
import { formatNumber, formatPercent, sliceUsageByRange } from "../api-key-formatters"

interface KeyUsageTabProps {
  apiKey: ProjectApiKeyDetail
}

const RANGE_OPTIONS: ReadonlyArray<{ value: ApiKeyUsageRange; label: string }> = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
]

const CHART_CONFIG = {
  promptTokens: {
    label: "Prompt Tokens",
    color: "hsl(var(--chart-1))",
  },
  completionTokens: {
    label: "Completion Tokens",
    color: "hsl(var(--chart-2))",
  },
  requests: {
    label: "请求数",
    color: "hsl(var(--chart-3))",
  },
  latencyMs: {
    label: "平均延迟",
    color: "hsl(var(--chart-4))",
  },
  status2xx: {
    label: "2xx",
    color: "hsl(var(--chart-3))",
  },
  status4xx: {
    label: "4xx",
    color: "hsl(var(--chart-2))",
  },
  status5xx: {
    label: "5xx",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleTimeString("zh-CN", { hour12: false, hour: "2-digit", minute: "2-digit" })
}

export function KeyUsageTab({ apiKey }: KeyUsageTabProps) {
  const [range, setRange] = useState<ApiKeyUsageRange>("24h")

  const usage = useMemo(() => sliceUsageByRange(apiKey.usage, range), [apiKey.usage, range])

  const summary = useMemo(() => {
    if (usage.length === 0) {
      return null
    }

    return usage.reduce(
      (accumulator, item) => {
        accumulator.requests += item.requests
        accumulator.totalTokens += item.totalTokens
        accumulator.promptTokens += item.promptTokens
        accumulator.completionTokens += item.completionTokens
        accumulator.latencyMs += item.latencyMs
        accumulator.status2xx += item.status2xx
        accumulator.status4xx += item.status4xx
        accumulator.status5xx += item.status5xx
        return accumulator
      },
      {
        requests: 0,
        totalTokens: 0,
        promptTokens: 0,
        completionTokens: 0,
        latencyMs: 0,
        status2xx: 0,
        status4xx: 0,
        status5xx: 0,
      },
    )
  }, [usage])

  if (usage.length === 0 || !summary) {
    return <EmptyState title="暂无用量数据" description="当前 Key 还没有调用记录。" />
  }

  const averageLatency = summary.latencyMs / usage.length
  const errorRate = ((summary.status4xx + summary.status5xx) / Math.max(summary.requests, 1)) * 100

  return (
    <div className="space-y-4">
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">请求总数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">{formatNumber(summary.requests, 0)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">
              {formatNumber(summary.totalTokens, 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">平均延迟</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">{formatNumber(averageLatency)} ms</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">错误率</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">{formatPercent(errorRate)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm">Tokens 趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={CHART_CONFIG} className="h-[220px] w-full min-w-0">
              <AreaChart data={usage} margin={{ left: 6, right: 6, top: 6, bottom: 6 }}>
                <defs>
                  <linearGradient id="key-usage-prompt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-promptTokens)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-promptTokens)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="key-usage-completion" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-completionTokens)"
                      stopOpacity={0.25}
                    />
                    <stop offset="95%" stopColor="var(--color-completionTokens)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tickFormatter={formatTime} minTickGap={14} />
                <YAxis />
                <ChartTooltip
                  content={
                    <ChartTooltipContent labelFormatter={(value) => formatTime(String(value))} />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="promptTokens"
                  stroke="var(--color-promptTokens)"
                  fill="url(#key-usage-prompt)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="completionTokens"
                  stroke="var(--color-completionTokens)"
                  fill="url(#key-usage-completion)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm">请求趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={CHART_CONFIG} className="h-[220px] w-full min-w-0">
              <LineChart data={usage} margin={{ left: 6, right: 6, top: 6, bottom: 6 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tickFormatter={formatTime} minTickGap={14} />
                <YAxis />
                <ChartTooltip
                  content={
                    <ChartTooltipContent labelFormatter={(value) => formatTime(String(value))} />
                  }
                />
                <Line
                  dataKey="requests"
                  type="monotone"
                  stroke="var(--color-requests)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm">延迟趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={CHART_CONFIG} className="h-[220px] w-full min-w-0">
              <LineChart data={usage} margin={{ left: 6, right: 6, top: 6, bottom: 6 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tickFormatter={formatTime} minTickGap={14} />
                <YAxis />
                <ChartTooltip
                  content={
                    <ChartTooltipContent labelFormatter={(value) => formatTime(String(value))} />
                  }
                />
                <Line
                  dataKey="latencyMs"
                  type="monotone"
                  stroke="var(--color-latencyMs)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm">状态码分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={CHART_CONFIG} className="h-[220px] w-full min-w-0">
              <BarChart data={usage} margin={{ left: 6, right: 6, top: 6, bottom: 6 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tickFormatter={formatTime} minTickGap={14} />
                <YAxis />
                <ChartTooltip
                  content={
                    <ChartTooltipContent labelFormatter={(value) => formatTime(String(value))} />
                  }
                />
                <Bar
                  dataKey="status2xx"
                  stackId="status"
                  fill="var(--color-status2xx)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar dataKey="status4xx" stackId="status" fill="var(--color-status4xx)" />
                <Bar
                  dataKey="status5xx"
                  stackId="status"
                  fill="var(--color-status5xx)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/50 bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>service</TableHead>
              <TableHead>requests</TableHead>
              <TableHead>total_tokens</TableHead>
              <TableHead>P95 latency</TableHead>
              <TableHead>error_rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKey.usageTopServices.map((service) => (
              <TableRow key={service.serviceId} className="transition-colors hover:bg-muted/50">
                <TableCell>{service.serviceName}</TableCell>
                <TableCell className="tabular-nums">{formatNumber(service.requests, 0)}</TableCell>
                <TableCell className="tabular-nums">
                  {formatNumber(service.totalTokens, 0)}
                </TableCell>
                <TableCell className="tabular-nums">
                  {formatNumber(service.p95LatencyMs)} ms
                </TableCell>
                <TableCell className="tabular-nums">{formatPercent(service.errorRate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
