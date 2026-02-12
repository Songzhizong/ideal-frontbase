import {
  CircleAlert,
  CircleCheck,
  Copy,
  Eye,
  MapPin,
  Plus,
  RefreshCw,
  RotateCcw,
  Shield,
  Timer,
} from "lucide-react"
import { parseAsInteger, parseAsStringLiteral } from "nuqs"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { OperationLogDetailDrawer } from "@/features/core/operation-log"
import { Api, fetchOperationLogList } from "@/features/core/operation-log/api/operation-log"
import {
  actionTypeOptions,
  getActionTypeConfig,
} from "@/features/core/operation-log/utils/operation-log-utils"
import { EmptyState } from "@/features/shared/components"
import { ContentLayout } from "@/packages/layout-core"
import {
  createColumnHelper,
  createCrudQueryPreset,
  DataTablePreset,
  DataTableViewOptions,
  type FilterDefinition,
  remote,
  stateUrl,
  useDataTable,
} from "@/packages/table"
import { Button } from "@/packages/ui/button"
import { DateRangePicker } from "@/packages/ui/date-picker-rac"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/packages/ui/dropdown-menu"
import { StatusBadge } from "@/packages/ui/status-badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/packages/ui/tooltip"
import { cn } from "@/packages/ui-utils"
import {
  formatTimestampToDateTime,
  formatTimestampToRelativeTime,
} from "@/packages/ui-utils/time-utils"
import { TenantAuditStatsCards } from "./tenant-audit-stats-cards"

interface TenantAuditPageProps {
  tenantId: string
  title?: string
  description?: string
  lockedProjectId?: string
  showProjectFilter?: boolean
}

const helper = createColumnHelper<Api.OperationLog.SimpleLog>()
const SUCCESS_FILTER_VALUES = ["", "true", "false"] as const
const ACTION_TYPE_FILTER_VALUES = ["", ...Object.values(Api.ActionType)] as const

type TenantAuditTableFilters = {
  startTimeMs: number | null
  endTimeMs: number | null
  success: (typeof SUCCESS_FILTER_VALUES)[number]
  actionType: "" | Api.ActionType
}

const FILTER_FIELDS: Array<FilterDefinition<TenantAuditTableFilters>> = [
  {
    key: "success",
    label: "状态",
    type: "select",
    placeholder: "状态",
    options: [
      { label: "全部", value: "" },
      { label: "成功", value: "true" },
      { label: "失败", value: "false" },
    ],
  },
  {
    key: "actionType",
    label: "操作类型",
    type: "select",
    placeholder: "操作类型",
    options: [
      { label: "全部", value: "" },
      ...actionTypeOptions
        .filter((item) => item.value !== "all")
        .map((item) => ({
          label: item.label,
          value: item.value as Api.ActionType,
        })),
    ],
  },
]

function formatIp(ip?: string | null) {
  if (!ip) return "--"
  if (ip === "0:0:0:0:0:0:0:1") return "127.0.0.1"
  return ip
}

export function TenantAuditPage({
  tenantId,
  title = "租户审计日志",
  description = "查看租户内所有用户与系统操作记录，支持按时间、状态和操作类型筛选。",
  lockedProjectId,
}: TenantAuditPageProps) {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)

  const state = stateUrl({
    key: `infera_tenant_audit_${tenantId}`,
    parsers: {
      startTimeMs: parseAsInteger,
      endTimeMs: parseAsInteger,
      success: parseAsStringLiteral(SUCCESS_FILTER_VALUES).withDefault(""),
      actionType: parseAsStringLiteral(ACTION_TYPE_FILTER_VALUES).withDefault(""),
    },
    defaults: {
      startTimeMs: null,
      endTimeMs: null,
      success: "",
      actionType: "",
    } satisfies TenantAuditTableFilters,
    pagination: {
      defaultPage: 1,
      defaultSize: 20,
    },
    behavior: {
      resetPageOnFilterChange: true,
      historyByReason: {
        filters: "replace",
        page: "push",
        size: "push",
        sort: "push",
      },
    },
  })

  const dataSource = useMemo(() => {
    return remote<
      Api.OperationLog.SimpleLog,
      TenantAuditTableFilters,
      Awaited<ReturnType<typeof fetchOperationLogList>>
    >({
      queryKey: ["tenant-audit-logs", tenantId, lockedProjectId],
      queryFn: ({ page, size, filters }) =>
        fetchOperationLogList({
          pageNumber: page,
          pageSize: size,
          success: filters.success || null,
          actionType: filters.actionType || null,
          startTimeMs: filters.startTimeMs,
          endTimeMs: filters.endTimeMs,
          ...(lockedProjectId ? { resourceId: lockedProjectId } : {}),
        }),
      map: (response) => ({
        rows: response.content,
        pageCount: response.totalPages,
        total: response.totalElements,
      }),
    })
  }, [tenantId, lockedProjectId])

  const columns = useMemo(() => {
    return [
      helper.display({
        id: "statusAction",
        header: "状态 / 操作",
        size: 220,
        minSize: 160,
        cell: (info) => {
          const log = info.row.original
          const actionConfig = getActionTypeConfig(log.actionType)

          return (
            <div
              className={cn(
                "flex min-w-0 items-start gap-3 border-l-2 border-l-transparent py-2 pl-2",
                log.sensitive && "border-l-error",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                  log.success ? "text-success" : "bg-error-subtle text-error-on-subtle",
                )}
              >
                {log.success ? (
                  <CircleCheck className="size-4" />
                ) : (
                  <CircleAlert className="size-4" />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex min-w-0 items-center gap-2">
                  <button
                    type="button"
                    className="max-w-55 cursor-pointer truncate text-left text-sm font-bold text-foreground transition-colors hover:text-primary"
                    onClick={() => setSelectedLogId(log.id)}
                  >
                    {log.actionName}
                  </button>
                  <StatusBadge
                    tone={actionConfig.tone}
                    variant="ghost"
                    className="h-3.5 whitespace-nowrap px-1.5 text-[10px] font-medium"
                  >
                    {actionConfig.label}
                  </StatusBadge>
                  {log.sensitive ? (
                    <StatusBadge tone="error" className="h-3.5 shrink-0 gap-1 px-1.5 text-[10px]">
                      <Shield className="size-2.5" />
                      敏感
                    </StatusBadge>
                  ) : null}
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
                  <span className="truncate">{log.moduleName || "未知模块"}</span>
                  <span className="opacity-40">/</span>
                  <span className="truncate font-medium">{log.resourceName || "--"}</span>
                  {log.resourceId && (
                    <>
                      <span className="opacity-40">/</span>
                      <button
                        type="button"
                        className="group/id flex items-center gap-1 hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (log.resourceId) {
                            navigator.clipboard.writeText(log.resourceId)
                            toast.success("资源 ID 已复制")
                          }
                        }}
                        title="点击复制资源ID"
                      >
                        <code className="rounded bg-muted/50 px-1 py-0.5 font-mono transition-colors group-hover/id:bg-muted">
                          {log.resourceId}
                        </code>
                        <Copy className="hidden size-2.5 opacity-60 group-hover/id:inline" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        },
      }),
      helper.display({
        id: "source",
        header: "来源",
        size: 160,
        cell: (info) => {
          const log = info.row.original
          const formattedIp = formatIp(log.clientIp)
          return (
            <div className="group flex items-center gap-1.5 py-1 text-xs text-muted-foreground/80">
              <MapPin className="size-3 shrink-0 opacity-60" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="truncate font-mono">
                    {formattedIp}
                    {log.clientLocation ? `（${log.clientLocation}）` : ""}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  IP: {log.clientIp || "--"}
                  {log.clientLocation ? (
                    <>
                      <br />
                      位置: {log.clientLocation}
                    </>
                  ) : null}
                </TooltipContent>
              </Tooltip>
              {log.clientIp && (
                <button
                  type="button"
                  className="hidden text-muted-foreground hover:text-foreground group-hover:inline-block"
                  onClick={() => {
                    navigator.clipboard.writeText(log.clientIp ?? "")
                    toast.success("IP 地址已复制")
                  }}
                  title="复制 IP"
                >
                  <Copy className="size-3" />
                </button>
              )}
            </div>
          )
        },
      }),
      helper.display({
        id: "duration",
        header: "耗时",
        size: 80,
        cell: (info) => {
          const duration = info.row.original.duration
          return (
            <div
              className={cn(
                "flex items-center gap-1.5 py-1 font-mono text-xs",
                duration > 800
                  ? "text-destructive"
                  : duration > 200
                    ? "text-warning"
                    : "text-muted-foreground/80",
              )}
            >
              <Timer className={cn("size-3 opacity-60", duration > 800 && "animate-pulse")} />
              <span>{duration}ms</span>
            </div>
          )
        },
      }),
      helper.display({
        id: "operator",
        header: "操作人",
        size: 100,
        cell: (info) => {
          const log = info.row.original
          return (
            <div className="flex min-w-0 flex-col gap-1 py-1">
              <span className="truncate text-sm font-medium text-foreground">
                {log.userDisplayName || "未知用户"}
              </span>
              <span className="truncate font-mono text-xs text-muted-foreground/70">
                {log.userAccount || "--"}
              </span>
            </div>
          )
        },
      }),
      helper.display({
        id: "time",
        header: "时间",
        size: 140,
        cell: (info) => {
          const log = info.row.original
          return (
            <div className="mr-2 flex items-center justify-between gap-2 py-1">
              <div className="min-w-0 space-y-1">
                <span className="block whitespace-nowrap text-sm font-semibold text-foreground">
                  {formatTimestampToDateTime(log.operationTime)}
                </span>
                <span className="block text-xs text-muted-foreground/70">
                  {formatTimestampToRelativeTime(log.operationTime)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-primary hover:bg-primary/10 hover:text-primary"
                onClick={() => setSelectedLogId(log.id)}
                aria-label="查看详情"
              >
                <Eye className="size-4" />
              </Button>
            </div>
          )
        },
      }),
    ]
  }, [])

  const dt = useDataTable<Api.OperationLog.SimpleLog, TenantAuditTableFilters>({
    columns,
    dataSource,
    state,
    getRowId: (row) => row.id,
    features: {
      density: {
        enabled: true,
        default: "compact",
        storageKey: `infera_tenant_audit_density_${tenantId}`,
      },
    },
  })

  const filterState = dt.filters.state
  const isRefreshing = dt.activity.isInitialLoading || dt.activity.isFetching
  const currentRows = dt.table.getRowModel().rows.map((row) => row.original)
  const auditStats = useMemo(() => {
    const totalLogs = dt.pagination.total ?? currentRows.length
    const baseCount = currentRows.length
    const sensitiveRows = currentRows.filter((log) => log.sensitive)
    const abnormalRows = currentRows.filter((log) => !log.success)

    const moduleSet = new Set(
      currentRows
        .map((log) => log.moduleName ?? log.moduleCode)
        .filter((moduleName): moduleName is string => Boolean(moduleName)),
    )
    const sensitiveModuleSet = new Set(
      sensitiveRows
        .map((log) => log.moduleName ?? log.moduleCode)
        .filter((moduleName): moduleName is string => Boolean(moduleName)),
    )

    const sensitiveRatio = baseCount === 0 ? 0 : (sensitiveRows.length / baseCount) * 100
    const abnormalRatio = baseCount === 0 ? 0 : (abnormalRows.length / baseCount) * 100
    const successRate =
      baseCount === 0 ? 100 : ((baseCount - abnormalRows.length) / baseCount) * 100

    return {
      totalLogs,
      moduleCount: moduleSet.size,
      sensitiveCount: sensitiveRows.length,
      sensitiveRatio,
      sensitiveModuleCount: sensitiveModuleSet.size,
      abnormalCount: abnormalRows.length,
      abnormalRatio,
      successRate,
    }
  }, [currentRows, dt.pagination.total])
  const successLabel =
    filterState.success === "" ? "状态" : filterState.success === "true" ? "成功" : "失败"
  const actionTypeLabel =
    actionTypeOptions.find((item) => item.value === filterState.actionType)?.label ?? "操作类型"

  return (
    <>
      <ContentLayout title={title} description={description} className="min-h-full">
        <TenantAuditStatsCards
          totalLogs={auditStats.totalLogs}
          moduleCount={auditStats.moduleCount}
          sensitiveCount={auditStats.sensitiveCount}
          sensitiveRatio={auditStats.sensitiveRatio}
          sensitiveModuleCount={auditStats.sensitiveModuleCount}
          abnormalCount={auditStats.abnormalCount}
          abnormalRatio={auditStats.abnormalRatio}
          successRate={auditStats.successRate}
        />

        <section className="rounded-2xl border border-border/40 bg-card shadow-sm transition-shadow duration-300 hover:shadow-md">
          <TooltipProvider delayDuration={200}>
            <DataTablePreset<Api.OperationLog.SimpleLog, TenantAuditTableFilters>
              dt={dt}
              layout={{ stickyQueryPanel: true, stickyHeader: true, stickyPagination: true }}
              query={createCrudQueryPreset<TenantAuditTableFilters>({
                search: false,
                activeFilters: FILTER_FIELDS,
                actions: (
                  <div className="flex flex-wrap items-center gap-2">
                    <DateRangePicker
                      value={
                        filterState.startTimeMs
                          ? {
                              from: new Date(filterState.startTimeMs),
                              to: filterState.endTimeMs
                                ? new Date(filterState.endTimeMs)
                                : undefined,
                            }
                          : undefined
                      }
                      onChange={(range) => {
                        if (!range?.from) {
                          dt.filters.setBatch({
                            startTimeMs: null,
                            endTimeMs: null,
                          })
                          return
                        }

                        dt.filters.setBatch({
                          startTimeMs: range.from.getTime(),
                          endTimeMs: range.to ? new Date(range.to).setHours(23, 59, 59, 999) : null,
                        })
                      }}
                      placeholder="时间范围"
                    />

                    <div className="flex items-center gap-0.5 rounded-lg border border-border/40 bg-background p-0.5 shadow-sm">
                      {[
                        { label: "1h", value: 1 * 60 * 60 * 1000 },
                        { label: "1d", value: 24 * 60 * 60 * 1000 },
                        { label: "7d", value: 7 * 24 * 60 * 60 * 1000 },
                      ].map((item) => (
                        <Button
                          key={item.label}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-8 px-0 text-[10px] font-medium hover:bg-muted"
                          onClick={() => {
                            const end = Date.now()
                            const start = end - item.value
                            dt.filters.setBatch({
                              startTimeMs: start,
                              endTimeMs: end,
                            })
                          }}
                        >
                          {item.label}
                        </Button>
                      ))}
                    </div>

                    <div className="h-4 w-px bg-border/40" />

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 gap-1.5 px-3">
                          <Plus className="size-3.5 opacity-60" />
                          <span className="text-xs">
                            {filterState.success === "" ? "状态" : `状态: ${successLabel}`}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-36">
                        <DropdownMenuLabel>状态对比</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup
                          value={filterState.success}
                          onValueChange={(value) =>
                            dt.filters.set(
                              "success",
                              (value === "true" || value === "false" ? value : "") as
                                | ""
                                | "true"
                                | "false",
                            )
                          }
                        >
                          <DropdownMenuRadioItem value="">全部</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="true">成功</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="false">失败</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 gap-1.5 px-3">
                          <Plus className="size-3.5 opacity-60" />
                          <span className="text-xs">
                            {filterState.actionType === ""
                              ? "操作类型"
                              : `类型: ${actionTypeLabel}`}
                          </span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-44">
                        <DropdownMenuLabel>操作类型</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup
                          value={filterState.actionType}
                          onValueChange={(value) =>
                            dt.filters.set(
                              "actionType",
                              (value === "" ||
                              Object.values(Api.ActionType).includes(value as Api.ActionType)
                                ? value
                                : "") as "" | Api.ActionType,
                            )
                          }
                        >
                          <DropdownMenuRadioItem value="">全部</DropdownMenuRadioItem>
                          {actionTypeOptions
                            .filter((option) => option.value !== "all")
                            .map((option) => (
                              <DropdownMenuRadioItem key={option.value} value={option.value}>
                                {option.label}
                              </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="ml-auto flex items-center gap-2">
                      <div className="flex items-center gap-1 rounded-md border border-border p-1 shadow-sm">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            dt.filters.setBatch({
                              startTimeMs: null,
                              endTimeMs: null,
                              success: "",
                              actionType: "",
                            })
                          }
                        >
                          <RotateCcw className="size-3" />
                          重置
                        </Button>
                        <div className="h-3 w-px bg-border" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-7 gap-1.5 px-2 text-xs transition-all",
                            isRefreshing
                              ? "bg-muted text-muted-foreground"
                              : "text-foreground hover:bg-primary/5",
                          )}
                          onClick={() => dt.actions.refetch()}
                          disabled={isRefreshing}
                        >
                          <RefreshCw className={cn("size-3", isRefreshing && "animate-spin")} />
                          刷新
                        </Button>
                      </div>
                      <div className="h-4 w-px bg-border/40" />
                      <DataTableViewOptions />
                    </div>
                  </div>
                ),
              })}
              table={{
                renderEmpty: () => (
                  <EmptyState
                    title="暂无审计日志"
                    description="当前筛选条件下没有匹配的日志记录。"
                  />
                ),
              }}
              pagination={{
                pageSizeOptions: [10, 20, 50, 100],
              }}
            />
          </TooltipProvider>
        </section>
      </ContentLayout>

      <OperationLogDetailDrawer
        open={selectedLogId !== null}
        logId={selectedLogId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedLogId(null)
          }
        }}
      />
    </>
  )
}
