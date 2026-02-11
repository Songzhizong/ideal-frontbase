import { AlertCircle, ExternalLink, RefreshCcw } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { buildProjectPath, buildTenantPath } from "@/components/workspace/workspace-context"
import { EmptyState, ErrorState } from "@/features/shared/components"
import { useBaseNavigate } from "@/hooks"
import { Badge } from "@/packages/ui/badge"
import { Button } from "@/packages/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { Skeleton } from "@/packages/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import { useTenantActiveAlertsQuery } from "../hooks"
import {
  TENANT_ALERT_STATUSES,
  TENANT_ALERT_TYPES,
  type TenantAlertStatus,
} from "../types/tenant-alerts"
import {
  formatAlertSeverity,
  formatAlertStatus,
  formatAlertType,
  formatDateTime,
  formatNumberWithUnit,
  getSeverityBadgeClassName,
  getStatusBadgeClassName,
} from "../utils/tenant-alerts-formatters"

interface TenantActiveAlertsTabProps {
  tenantId: string
  onAckAlert: (alertId: string) => Promise<void>
  ackLoading: boolean
}

const STATUS_OPTIONS: ReadonlyArray<{ value: "all" | TenantAlertStatus; label: string }> = [
  {
    value: "all",
    label: "全部状态",
  },
  ...TENANT_ALERT_STATUSES.map((status) => ({
    value: status,
    label: formatAlertStatus(status),
  })),
]

const TYPE_OPTIONS = [
  {
    value: "all",
    label: "全部类型",
  },
  ...TENANT_ALERT_TYPES.map((type) => ({
    value: type,
    label: formatAlertType(type),
  })),
] as const

function ActiveAlertsLoadingState() {
  return (
    <div className="space-y-2 rounded-lg border border-border/50 bg-card p-4">
      {[0, 1, 2, 3].map((item) => (
        <Skeleton key={item} className="h-10 w-full" />
      ))}
    </div>
  )
}

export function TenantActiveAlertsTab({
  tenantId,
  onAckAlert,
  ackLoading,
}: TenantActiveAlertsTabProps) {
  const navigate = useBaseNavigate()
  const [status, setStatus] = useState<"all" | TenantAlertStatus>("all")
  const [type, setType] = useState<"all" | (typeof TENANT_ALERT_TYPES)[number]>("all")

  const query = useTenantActiveAlertsQuery({
    tenantId,
    status: status === "all" ? undefined : status,
    type: type === "all" ? undefined : type,
  })

  const alerts = query.data?.items ?? []

  const openCount = useMemo(() => alerts.filter((item) => item.status === "Open").length, [alerts])

  if (query.isPending) {
    return <ActiveAlertsLoadingState />
  }

  if (query.isError) {
    return (
      <ErrorState
        title="当前告警加载失败"
        message="无法读取当前告警列表，请稍后重试。"
        error={query.error}
        onRetry={() => {
          void query.refetch()
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-destructive/20 bg-destructive/10 text-destructive"
          >
            Open: {openCount}
          </Badge>
          <span className="text-xs text-muted-foreground">共 {alerts.length} 条活跃告警</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={status}
            onValueChange={(value: "all" | TenantAlertStatus) => setStatus(value)}
          >
            <SelectTrigger className="w-[160px] cursor-pointer">
              <SelectValue placeholder="状态筛选" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={type}
            onValueChange={(value: "all" | (typeof TENANT_ALERT_TYPES)[number]) => setType(value)}
          >
            <SelectTrigger className="w-[160px] cursor-pointer">
              <SelectValue placeholder="类型筛选" />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            disabled={query.isFetching}
            onClick={() => {
              void query.refetch()
            }}
          >
            <RefreshCcw className={query.isFetching ? "size-4 animate-spin" : "size-4"} />
            刷新
          </Button>
        </div>
      </div>

      {alerts.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="暂无符合条件的活跃告警"
          description="当前筛选条件下未发现处于触发态的告警。"
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border/50">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>级别</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>范围</TableHead>
                <TableHead>触发时间</TableHead>
                <TableHead>当前值 / 阈值</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow key={alert.alertId}>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`border px-2 py-0.5 text-xs ${getSeverityBadgeClassName(alert.severity)}`}
                    >
                      {formatAlertSeverity(alert.severity)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{formatAlertType(alert.type)}</TableCell>
                  <TableCell className="max-w-[220px] truncate text-muted-foreground text-xs">
                    {alert.scopeName}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatDateTime(alert.triggeredAt)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {formatNumberWithUnit(alert.currentValue, alert.unit)} /{" "}
                    {formatNumberWithUnit(alert.thresholdValue, alert.unit)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`border px-2 py-0.5 text-xs ${getStatusBadgeClassName(alert.status)}`}
                    >
                      {formatAlertStatus(alert.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => {
                          toast.info(alert.summary)
                        }}
                      >
                        查看详情
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => {
                          const to = alert.projectId
                            ? buildProjectPath(tenantId, alert.projectId, "/dashboard")
                            : buildTenantPath(tenantId, "/overview")
                          void navigate({ to })
                        }}
                      >
                        <ExternalLink className="size-4" />
                        跳转
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        className="cursor-pointer"
                        disabled={ackLoading || alert.status !== "Open"}
                        onClick={() => {
                          void onAckAlert(alert.alertId)
                        }}
                      >
                        Ack
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
