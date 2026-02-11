import { Download, PieChart, RefreshCcw } from "lucide-react"
import { useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { EmptyState, ErrorState } from "@/features/shared/components"
import { useTenantCostAllocationQuery } from "@/features/tenant/billing"
import { Button } from "@/packages/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/packages/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { Skeleton } from "@/packages/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import type { TenantBillingRange, TenantCostAllocationGroup } from "../types/tenant-billing"
import {
  downloadCsv,
  formatCurrency,
  formatInteger,
  formatPercent,
  formatTokenCount,
} from "../utils/tenant-billing-formatters"

interface TenantCostAllocationTabProps {
  tenantId: string
}

const COST_ALLOCATION_GROUP_OPTIONS: ReadonlyArray<{
  value: TenantCostAllocationGroup
  label: string
}> = [
  { value: "project", label: "按项目" },
  { value: "api_key", label: "按 API Key" },
  { value: "service", label: "按服务" },
]

const RANGE_OPTIONS: ReadonlyArray<{ value: TenantBillingRange; label: string }> = [
  { value: "7d", label: "近 7 天" },
  { value: "30d", label: "近 30 天" },
]

const COST_ALLOCATION_CHART_CONFIG = {
  costCny: {
    label: "成本",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

function CostAllocationLoadingState() {
  return (
    <Card className="border-border/50 py-0">
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-56" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className={"h-70 w-full"} />
        <Skeleton className="h-44 w-full" />
      </CardContent>
    </Card>
  )
}

function getGroupLabel(group: TenantCostAllocationGroup) {
  if (group === "project") {
    return "项目"
  }
  if (group === "api_key") {
    return "API Key"
  }
  return "服务"
}

export function TenantCostAllocationTab({ tenantId }: TenantCostAllocationTabProps) {
  const [range, setRange] = useState<TenantBillingRange>("30d")
  const [groupBy, setGroupBy] = useState<TenantCostAllocationGroup>("project")

  const allocationQuery = useTenantCostAllocationQuery({
    tenantId,
    range,
    groupBy,
  })
  const allocationData = allocationQuery.data

  const topRows = useMemo(() => {
    if (!allocationData) {
      return []
    }
    return allocationData.rows.slice(0, 8)
  }, [allocationData])

  if (allocationQuery.isPending) {
    return <CostAllocationLoadingState />
  }

  if (allocationQuery.isError) {
    return (
      <ErrorState
        title="成本分摊加载失败"
        message="无法获取 Cost Allocation 数据，请稍后重试。"
        error={allocationQuery.error}
        onRetry={() => {
          void allocationQuery.refetch()
        }}
      />
    )
  }

  if (!allocationData || allocationData.rows.length === 0) {
    return (
      <EmptyState
        icon={PieChart}
        title="暂无成本分摊数据"
        description="当前范围下没有可分摊成本，稍后可刷新查看。"
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={groupBy}
            onValueChange={(value) => {
              if (value === "project" || value === "api_key" || value === "service") {
                setGroupBy(value)
              }
            }}
          >
            <SelectTrigger className={"w-37.5 cursor-pointer"}>
              <SelectValue placeholder="选择分组" />
            </SelectTrigger>
            <SelectContent>
              {COST_ALLOCATION_GROUP_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card p-1">
            {RANGE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={range === option.value ? "default" : "ghost"}
                onClick={() => setRange(option.value)}
                className="cursor-pointer"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const rows = [
                [
                  getGroupLabel(groupBy),
                  "成本(CNY)",
                  "成本占比",
                  "Tokens",
                  "请求量",
                  "平均延迟(ms)",
                ],
                ...allocationData.rows.map((row) => [
                  row.displayName,
                  String(row.costCny),
                  String(row.shareRate),
                  String(row.tokens),
                  String(row.requests),
                  String(row.avgLatencyMs),
                ]),
              ]
              downloadCsv(`cost-allocation-${groupBy}-${range}.csv`, rows)
            }}
            className="cursor-pointer"
          >
            <Download className="size-4" aria-hidden />
            导出 CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              void allocationQuery.refetch()
            }}
            disabled={allocationQuery.isFetching}
            className="cursor-pointer"
          >
            <RefreshCcw
              className={allocationQuery.isFetching ? "size-4 animate-spin" : "size-4"}
              aria-hidden
            />
            刷新
          </Button>
        </div>
      </div>

      <Card className="border-border/50 py-0">
        <CardHeader className="space-y-1 border-b border-border/50 px-4 py-4">
          <CardTitle className="text-sm font-semibold">成本分摊 Top 8</CardTitle>
          <CardDescription>
            按 {getGroupLabel(groupBy)} 维度查看本期成本分布，总成本{" "}
            {formatCurrency(allocationData.totalCostCny)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 py-4">
          <ChartContainer config={COST_ALLOCATION_CHART_CONFIG} className={"h-75 w-full min-w-0"}>
            <BarChart data={topRows} margin={{ top: 20, right: 8, left: 8, bottom: 0 }}>
              <defs />
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="var(--border)"
                opacity={0.4}
              />
              <XAxis
                dataKey="displayName"
                tickLine={false}
                axisLine={false}
                tickMargin={12}
                minTickGap={16}
                className="text-[10px] text-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatInteger(Number(value))}
                width={72}
                className="text-[10px] text-muted-foreground"
              />
              <ChartTooltip
                cursor={{ fill: "var(--muted)", opacity: 0.2 }}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    formatter={(value) => [formatCurrency(Number(value)), "成本"]}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="costCny"
                fill="var(--color-costCny)"
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ChartContainer>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-transparent">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-10 text-xs font-semibold text-foreground">
                    {getGroupLabel(groupBy)}
                  </TableHead>
                  <TableHead className="h-10 text-right text-xs font-semibold text-foreground">
                    成本
                  </TableHead>
                  <TableHead className="h-10 text-right text-xs font-semibold text-foreground">
                    成本占比
                  </TableHead>
                  <TableHead className="h-10 text-right text-xs font-semibold text-foreground">
                    Tokens
                  </TableHead>
                  <TableHead className="h-10 text-right text-xs font-semibold text-foreground">
                    请求量
                  </TableHead>
                  <TableHead className="h-10 text-right text-xs font-semibold text-foreground">
                    平均延迟
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocationData.rows.map((row) => (
                  <TableRow
                    key={row.allocationKey}
                    className="group border-border/40 last:border-0 hover:bg-muted/30"
                  >
                    <TableCell className="py-3 font-medium">{row.displayName}</TableCell>
                    <TableCell className="py-3 text-right font-mono text-sm font-semibold tabular-nums text-foreground">
                      {formatCurrency(row.costCny)}
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <span className="font-mono text-sm tabular-nums text-foreground/80">
                          {formatPercent(row.shareRate)}
                        </span>
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted/50 hidden sm:block">
                          <div
                            className="h-full bg-primary/60 transition-all group-hover:bg-primary"
                            style={{ width: `${row.shareRate * 100}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-right font-mono text-sm tabular-nums text-foreground/70">
                      {formatTokenCount(row.tokens)}
                    </TableCell>
                    <TableCell className="py-3 text-right font-mono text-sm tabular-nums text-foreground/70">
                      {formatInteger(row.requests)}
                    </TableCell>
                    <TableCell className="py-3 text-right font-mono text-sm tabular-nums text-foreground/70">
                      {formatInteger(row.avgLatencyMs)} ms
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
