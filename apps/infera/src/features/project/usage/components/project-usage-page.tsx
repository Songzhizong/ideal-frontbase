import { Download, Funnel, RefreshCcw } from "lucide-react"
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
import { ContentLayout } from "@/components/content-layout"
import { buildProjectPath } from "@/components/workspace/workspace-context"
import { EmptyState, ErrorState } from "@/features/shared/components"
import { useBaseNavigate } from "@/packages/platform-router"
import { Button } from "@/packages/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/packages/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/packages/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import { useProjectUsageQuery } from "../hooks"
import type { UsageFilterState, UsageGroupBy } from "../types"
import {
  downloadCsv,
  formatCurrency,
  formatDateTime,
  formatNumber,
  formatPercent,
  formatTrendTick,
} from "./usage-formatters"

interface ProjectUsagePageProps {
  tenantId: string
  projectId: string
}

const DEFAULT_FILTERS: UsageFilterState = {
  range: "7d",
  groupBy: "service",
  granularity: "hour",
  serviceId: "all",
  revisionId: "all",
  apiKeyId: "all",
  modelVersionId: "all",
  statusFamily: "all",
}

const GROUP_BY_OPTIONS: Array<{ value: UsageGroupBy; label: string }> = [
  { value: "service", label: "Service" },
  { value: "revision", label: "Revision" },
  { value: "apiKey", label: "API Key" },
  { value: "modelVersion", label: "Model Version" },
  { value: "statusCode", label: "Status Code" },
]

const GROUP_BY_LABEL_MAP: Record<UsageGroupBy, string> = {
  service: "Service",
  revision: "Revision",
  apiKey: "API Key",
  modelVersion: "Model Version",
  statusCode: "Status Code",
}

const CHART_CONFIG = {
  promptTokens: {
    label: "Prompt Tokens",
    color: "hsl(var(--chart-1))",
  },
  completionTokens: {
    label: "Completion Tokens",
    color: "hsl(var(--chart-2))",
  },
  estimatedCostCny: {
    label: "成本",
    color: "hsl(var(--chart-2))",
  },
  requests: {
    label: "请求数",
    color: "hsl(var(--chart-1))",
  },
  avgLatencyMs: {
    label: "平均延迟",
    color: "hsl(var(--chart-4))",
  },
  p95LatencyMs: {
    label: "P95 延迟",
    color: "hsl(var(--chart-5))",
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

export function ProjectUsagePage({ tenantId, projectId }: ProjectUsagePageProps) {
  const navigate = useBaseNavigate()
  const [filters, setFilters] = useState<UsageFilterState>(DEFAULT_FILTERS)

  const query = useProjectUsageQuery(tenantId, projectId, filters)
  const usage = query.data

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        className="cursor-pointer"
        onClick={() => {
          void query.refetch()
        }}
        disabled={query.isFetching}
      >
        <RefreshCcw className={query.isFetching ? "size-4 animate-spin" : "size-4"} aria-hidden />
        刷新
      </Button>
      <Button
        type="button"
        variant="outline"
        className="cursor-pointer"
        disabled={!usage || usage.aggregates.length === 0}
        onClick={() => {
          if (!usage) {
            return
          }

          downloadCsv(
            `usage-${filters.groupBy}-${Date.now()}.csv`,
            [
              GROUP_BY_LABEL_MAP[filters.groupBy],
              "requests",
              "total_tokens",
              "avg_latency_ms",
              "p95_latency_ms",
              "error_rate",
              "estimated_cost_cny",
            ],
            usage.aggregates.map((row) => [
              row.groupValue,
              row.requests,
              row.totalTokens,
              row.avgLatencyMs,
              row.p95LatencyMs,
              row.errorRate,
              row.estimatedCostCny,
            ]),
          )
        }}
      >
        <Download className="size-4" aria-hidden />
        导出 CSV
      </Button>
    </div>
  )

  const groupColumnLabel = GROUP_BY_LABEL_MAP[filters.groupBy]

  const statusDistribution = useMemo(() => {
    return usage?.statusCodeDistribution ?? []
  }, [usage?.statusCodeDistribution])

  return (
    <ContentLayout
      title="用量与成本"
      description="按时间范围、分组维度和过滤条件分析 tokens、请求延迟与成本走势。"
      actions={headerActions}
    >
      <div className="grid gap-3 rounded-xl border border-border/50 bg-card p-4 lg:grid-cols-4">
        <Select
          value={filters.range}
          onValueChange={(value) =>
            setFilters((previous) => ({ ...previous, range: value as UsageFilterState["range"] }))
          }
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue placeholder="时间范围" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h" className="cursor-pointer">
              最近 24h
            </SelectItem>
            <SelectItem value="7d" className="cursor-pointer">
              最近 7d
            </SelectItem>
            <SelectItem value="30d" className="cursor-pointer">
              最近 30d
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.groupBy}
          onValueChange={(value) =>
            setFilters((previous) => ({
              ...previous,
              groupBy: value as UsageFilterState["groupBy"],
            }))
          }
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue placeholder="Group by" />
          </SelectTrigger>
          <SelectContent>
            {GROUP_BY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.granularity}
          onValueChange={(value) =>
            setFilters((previous) => ({
              ...previous,
              granularity: value as UsageFilterState["granularity"],
            }))
          }
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue placeholder="粒度" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hour" className="cursor-pointer">
              小时
            </SelectItem>
            <SelectItem value="day" className="cursor-pointer">
              天
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.statusFamily}
          onValueChange={(value) =>
            setFilters((previous) => ({
              ...previous,
              statusFamily: value as UsageFilterState["statusFamily"],
            }))
          }
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue placeholder="状态码" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              全部状态码
            </SelectItem>
            <SelectItem value="2xx" className="cursor-pointer">
              2xx
            </SelectItem>
            <SelectItem value="4xx" className="cursor-pointer">
              4xx
            </SelectItem>
            <SelectItem value="5xx" className="cursor-pointer">
              5xx
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.serviceId}
          onValueChange={(value) => setFilters((previous) => ({ ...previous, serviceId: value }))}
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue placeholder="Service 过滤" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              全部 Service
            </SelectItem>
            {usage?.filterOptions.services.map((item) => (
              <SelectItem key={item.value} value={item.value} className="cursor-pointer">
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.revisionId}
          onValueChange={(value) => setFilters((previous) => ({ ...previous, revisionId: value }))}
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue placeholder="Revision 过滤" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              全部 Revision
            </SelectItem>
            {usage?.filterOptions.revisions.map((item) => (
              <SelectItem key={item.value} value={item.value} className="cursor-pointer">
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.apiKeyId}
          onValueChange={(value) => setFilters((previous) => ({ ...previous, apiKeyId: value }))}
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue placeholder="API Key 过滤" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">
              全部 API Key
            </SelectItem>
            {usage?.filterOptions.apiKeys.map((item) => (
              <SelectItem key={item.value} value={item.value} className="cursor-pointer">
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Select
            value={filters.modelVersionId}
            onValueChange={(value) =>
              setFilters((previous) => ({ ...previous, modelVersionId: value }))
            }
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue placeholder="Model Version 过滤" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                全部 Model Version
              </SelectItem>
              {usage?.filterOptions.modelVersions.map((item) => (
                <SelectItem key={item.value} value={item.value} className="cursor-pointer">
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => setFilters(DEFAULT_FILTERS)}
          >
            <Funnel className="size-4" aria-hidden />
            重置
          </Button>
        </div>
      </div>

      {query.isError ? (
        <ErrorState
          title="用量数据加载失败"
          message="无法获取当前项目的用量与成本信息，请稍后重试。"
          error={query.error}
          onRetry={() => {
            void query.refetch()
          }}
        />
      ) : null}

      {query.isPending ? (
        <div className="rounded-xl border border-border/50 bg-card p-6 text-sm text-muted-foreground">
          用量数据加载中...
        </div>
      ) : null}

      {!query.isPending && !query.isError && usage ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Prompt Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums">
                  {formatNumber(usage.metrics.promptTokens, 0)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Completion Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums">
                  {formatNumber(usage.metrics.completionTokens, 0)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">平均延迟 / P95</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums">
                  {formatNumber(usage.metrics.avgLatencyMs)} /{" "}
                  {formatNumber(usage.metrics.p95LatencyMs)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">成功率</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums">
                  {formatPercent(usage.metrics.successRate)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">预估成本</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold tabular-nums">
                  {formatCurrency(usage.metrics.estimatedCostCny)}
                </p>
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
                  <AreaChart data={usage.trends} margin={{ left: 6, right: 6, top: 6, bottom: 6 }}>
                    <defs>
                      <linearGradient id="usage-prompt-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--color-promptTokens)"
                          stopOpacity={0.25}
                        />
                        <stop offset="95%" stopColor="var(--color-promptTokens)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="usage-completion-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--color-completionTokens)"
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-completionTokens)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(value) =>
                        formatTrendTick(String(value), usage.filters.granularity)
                      }
                      minTickGap={14}
                    />
                    <YAxis />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value) =>
                            formatTrendTick(String(value), usage.filters.granularity)
                          }
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="promptTokens"
                      stroke="var(--color-promptTokens)"
                      fill="url(#usage-prompt-gradient)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="completionTokens"
                      stroke="var(--color-completionTokens)"
                      fill="url(#usage-completion-gradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-sm">成本趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={CHART_CONFIG} className="h-[220px] w-full min-w-0">
                  <LineChart data={usage.trends} margin={{ left: 6, right: 6, top: 6, bottom: 6 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(value) =>
                        formatTrendTick(String(value), usage.filters.granularity)
                      }
                      minTickGap={14}
                    />
                    <YAxis />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value) =>
                            formatTrendTick(String(value), usage.filters.granularity)
                          }
                        />
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="estimatedCostCny"
                      stroke="var(--color-estimatedCostCny)"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-sm">请求数趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={CHART_CONFIG} className="h-[220px] w-full min-w-0">
                  <LineChart data={usage.trends} margin={{ left: 6, right: 6, top: 6, bottom: 6 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(value) =>
                        formatTrendTick(String(value), usage.filters.granularity)
                      }
                      minTickGap={14}
                    />
                    <YAxis />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value) =>
                            formatTrendTick(String(value), usage.filters.granularity)
                          }
                        />
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="requests"
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
                  <LineChart data={usage.trends} margin={{ left: 6, right: 6, top: 6, bottom: 6 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(value) =>
                        formatTrendTick(String(value), usage.filters.granularity)
                      }
                      minTickGap={14}
                    />
                    <YAxis />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value) =>
                            formatTrendTick(String(value), usage.filters.granularity)
                          }
                        />
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="avgLatencyMs"
                      stroke="var(--color-avgLatencyMs)"
                      strokeWidth={2.5}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="p95LatencyMs"
                      stroke="var(--color-p95LatencyMs)"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-border/50 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm">状态码分布</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={CHART_CONFIG} className="h-[220px] w-full min-w-0">
                  <BarChart
                    data={statusDistribution}
                    margin={{ left: 6, right: 6, top: 6, bottom: 6 }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3 rounded-xl border border-border/50 bg-card p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">聚合明细</h3>
              <p className="text-xs text-muted-foreground">
                更新于 {formatDateTime(usage.updatedAt)}
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border/50">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>{groupColumnLabel}</TableHead>
                    <TableHead>requests</TableHead>
                    <TableHead>total_tokens</TableHead>
                    <TableHead>avg_latency</TableHead>
                    <TableHead>p95_latency</TableHead>
                    <TableHead>error_rate</TableHead>
                    <TableHead>estimated_cost</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usage.aggregates.map((row) => (
                    <TableRow key={row.rowId} className="transition-colors hover:bg-muted/50">
                      <TableCell>{row.groupValue}</TableCell>
                      <TableCell className="tabular-nums">
                        {formatNumber(row.requests, 0)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatNumber(row.totalTokens, 0)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatNumber(row.avgLatencyMs)} ms
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatNumber(row.p95LatencyMs)} ms
                      </TableCell>
                      <TableCell className="tabular-nums">{formatPercent(row.errorRate)}</TableCell>
                      <TableCell className="tabular-nums">
                        {formatCurrency(row.estimatedCostCny)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          {row.drilldown ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="cursor-pointer"
                              onClick={() => {
                                if (row.drilldown?.type === "service") {
                                  void navigate({
                                    to: buildProjectPath(
                                      tenantId,
                                      projectId,
                                      `/services/${row.drilldown.id}?tab=metrics`,
                                    ),
                                  })
                                  return
                                }

                                if (row.drilldown?.type === "apiKey") {
                                  void navigate({
                                    to: buildProjectPath(
                                      tenantId,
                                      projectId,
                                      `/api-keys/${row.drilldown.id}?tab=usage`,
                                    ),
                                  })
                                }
                              }}
                            >
                              钻取
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      ) : null}

      {!query.isPending && !query.isError && usage && usage.trends.length === 0 ? (
        <EmptyState title="暂无用量数据" description="当前筛选条件下没有可展示的用量记录。" />
      ) : null}
    </ContentLayout>
  )
}
