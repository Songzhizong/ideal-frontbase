import { CircleAlert, CircleCheck, Copy, Eye, MapPin, RefreshCw, Shield, Timer } from "lucide-react"
import { parseAsInteger, parseAsString, parseAsStringLiteral } from "nuqs"
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
  createDataTableQueryPreset,
  DataTablePreset,
  type DataTableQueryField,
  DataTableViewOptions,
  remote,
  stateUrl,
  useDataTable,
} from "@/packages/table"
import { Button } from "@/packages/ui/button"
import { DateRangePicker } from "@/packages/ui/date-picker-rac"
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
  keyword: string
  startTimeMs: number | null
  endTimeMs: number | null
  success: (typeof SUCCESS_FILTER_VALUES)[number]
  actionType: "" | Api.ActionType
}

type AuditTimeRangeValue = { from: Date | undefined; to: Date | undefined }
type AuditQuickRangeValue = {
  startTimeMs: number | null
  endTimeMs: number | null
}

function formatIp(ip?: string | null) {
  if (!ip) return "--"
  if (ip === "0:0:0:0:0:0:0:1") return "127.0.0.1"
  return ip
}

function formatRangeDate(ms: number) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(new Date(ms))
}

function resolveAuditTimeRange(filters: TenantAuditTableFilters): AuditTimeRangeValue | undefined {
  if (filters.startTimeMs == null && filters.endTimeMs == null) return undefined
  return {
    from: filters.startTimeMs != null ? new Date(filters.startTimeMs) : undefined,
    to: filters.endTimeMs != null ? new Date(filters.endTimeMs) : undefined,
  }
}

function resolveAuditTimeRangeUpdate(
  value: unknown,
): Pick<TenantAuditTableFilters, "startTimeMs" | "endTimeMs"> {
  if (typeof value !== "object" || value === null) {
    return {
      startTimeMs: null,
      endTimeMs: null,
    }
  }
  const from = "from" in value && value.from instanceof Date ? value.from : undefined
  const to = "to" in value && value.to instanceof Date ? value.to : undefined
  if (!from) {
    return {
      startTimeMs: null,
      endTimeMs: null,
    }
  }
  return {
    startTimeMs: from.getTime(),
    endTimeMs: to ? new Date(to).setHours(23, 59, 59, 999) : null,
  }
}

export function TenantAuditPage({
  tenantId,
  title = "安全审计看板",
  description = "监控系统核心敏感操作，追溯每一次请求背后的来源与意图。",
  lockedProjectId,
}: TenantAuditPageProps) {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)

  const state = stateUrl({
    key: `infera_tenant_audit_${tenantId}`,
    parsers: {
      keyword: parseAsString.withDefault(""),
      startTimeMs: parseAsInteger,
      endTimeMs: parseAsInteger,
      success: parseAsStringLiteral(SUCCESS_FILTER_VALUES).withDefault(""),
      actionType: parseAsStringLiteral(ACTION_TYPE_FILTER_VALUES).withDefault(""),
    },
    defaults: {
      keyword: "",
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
                "flex min-w-0 items-center gap-3 border-l-2 border-l-transparent pl-2",
                log.sensitive && "border-l-error",
              )}
            >
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full",
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
            <div className="group flex items-center gap-1.5 text-xs text-muted-foreground/80">
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
                "flex items-center gap-1.5 font-mono text-xs",
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
            <div className="flex min-w-0 flex-col gap-1">
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
            <div className="mr-2 flex items-center justify-between gap-2">
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
        default: "comfortable",
        storageKey: `infera_tenant_audit_density_${tenantId}`,
      },
    },
  })

  const queryFields = useMemo<Array<DataTableQueryField<TenantAuditTableFilters>>>(() => {
    return [
      {
        id: "keyword",
        label: "关键字",
        kind: "text",
        search: {
          pickerVisible: false,
        },
        ui: {
          panel: "hidden",
        },
        placeholder: "搜索操作名称、操作人、资源 ID（即将支持）",
        binding: {
          mode: "single",
          key: "keyword",
        },
      },
      {
        id: "timeRange",
        label: "时间范围",
        kind: "custom",
        binding: {
          mode: "composite",
          keys: ["startTimeMs", "endTimeMs"],
          getValue: resolveAuditTimeRange,
          setValue: (value) => resolveAuditTimeRangeUpdate(value),
          clearValue: () => ({
            startTimeMs: null,
            endTimeMs: null,
          }),
          isEmpty: (value) => {
            if (typeof value !== "object" || value === null) return true
            const from = "from" in value ? value.from : undefined
            const to = "to" in value ? value.to : undefined
            return !(from instanceof Date) && !(to instanceof Date)
          },
        },
        render: ({ value, setValue }) => (
          <DateRangePicker
            value={value as AuditTimeRangeValue | undefined}
            onChange={(range) => {
              setValue(range)
            }}
            className="w-fit"
            triggerClassName="border-border/50 bg-muted/20 shadow-none hover:bg-muted/30"
          />
        ),
        chip: {
          formatValue: (value) => {
            if (typeof value !== "object" || value === null) return ""
            const from = "from" in value && value.from instanceof Date ? value.from : undefined
            const to = "to" in value && value.to instanceof Date ? value.to : undefined
            if (!from && !to) return ""
            const startLabel = from ? formatRangeDate(from.getTime()) : "起始未设定"
            const endLabel = to ? formatRangeDate(to.getTime()) : "至今"
            return `${startLabel} - ${endLabel}`
          },
        },
      },
      {
        id: "timeQuickPreset",
        label: "快速时间",
        kind: "custom",
        ui: {
          containerClassName: "min-w-fit",
        },
        binding: {
          mode: "composite",
          keys: ["startTimeMs", "endTimeMs"],
          getValue: () => null,
          setValue: (value) => {
            if (typeof value !== "object" || value === null) {
              return {
                startTimeMs: null,
                endTimeMs: null,
              }
            }
            const next = value as Partial<AuditQuickRangeValue>
            return {
              startTimeMs: typeof next.startTimeMs === "number" ? next.startTimeMs : null,
              endTimeMs: typeof next.endTimeMs === "number" ? next.endTimeMs : null,
            }
          },
          clearValue: () => ({
            startTimeMs: null,
            endTimeMs: null,
          }),
          isEmpty: () => true,
        },
        render: ({ setValue }) => (
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
                  setValue({
                    startTimeMs: start,
                    endTimeMs: end,
                  } satisfies AuditQuickRangeValue)
                }}
              >
                {item.label}
              </Button>
            ))}
          </div>
        ),
        chip: {
          hidden: true,
        },
      },
      {
        id: "success",
        label: "状态",
        kind: "select",
        ui: {
          panel: "secondary",
        },
        placeholder: "状态",
        binding: {
          mode: "single",
          key: "success",
        },
        options: [
          { label: "全部", value: "" },
          { label: "成功", value: "true" },
          { label: "失败", value: "false" },
        ],
      },
      {
        id: "actionType",
        label: "操作类型",
        kind: "select",
        ui: {
          panel: "secondary",
        },
        placeholder: "操作类型",
        binding: {
          mode: "single",
          key: "actionType",
        },
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
  }, [])
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
              query={createDataTableQueryPreset<TenantAuditTableFilters>({
                schema: {
                  fields: queryFields,
                  search: {
                    placeholder: "搜索操作名称、操作人、资源 ID（即将支持）",
                  },
                },
                slots: {
                  actionsRight: (
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 border border-border/50 bg-muted/20 text-muted-foreground shadow-none hover:bg-muted/30 hover:text-foreground"
                        onClick={() => dt.actions.refetch()}
                        aria-label="刷新"
                        disabled={isRefreshing}
                      >
                        <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                      </Button>
                      <DataTableViewOptions />
                    </div>
                  ),
                },
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
