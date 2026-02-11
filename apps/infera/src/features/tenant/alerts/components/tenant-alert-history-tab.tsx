import { History, RefreshCcw } from "lucide-react"
import { useState } from "react"
import { EmptyState, ErrorState } from "@/features/shared/components"
import { Badge } from "@/packages/ui/badge"
import { Button } from "@/packages/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { Skeleton } from "@/packages/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import { useTenantAlertHistoryQuery } from "../hooks"
import {
  TENANT_ALERT_EVENTS,
  TENANT_ALERT_STATUSES,
  TENANT_ALERT_TYPES,
  type TenantAlertEvent,
  type TenantAlertStatus,
} from "../types/tenant-alerts"
import {
  formatAlertStatus,
  formatAlertType,
  formatDateTime,
  getStatusBadgeClassName,
} from "../utils/tenant-alerts-formatters"

interface TenantAlertHistoryTabProps {
  tenantId: string
}

function HistoryLoadingState() {
  return (
    <div className="space-y-2 rounded-lg border border-border/50 bg-card p-4">
      {[0, 1, 2, 3].map((item) => (
        <Skeleton key={item} className="h-10 w-full" />
      ))}
    </div>
  )
}

export function TenantAlertHistoryTab({ tenantId }: TenantAlertHistoryTabProps) {
  const [event, setEvent] = useState<"all" | TenantAlertEvent>("all")
  const [type, setType] = useState<"all" | (typeof TENANT_ALERT_TYPES)[number]>("all")
  const [status, setStatus] = useState<"all" | TenantAlertStatus>("all")

  const query = useTenantAlertHistoryQuery({
    tenantId,
    event: event === "all" ? undefined : event,
    type: type === "all" ? undefined : type,
    status: status === "all" ? undefined : status,
  })

  const history = query.data?.items ?? []

  if (query.isPending) {
    return <HistoryLoadingState />
  }

  if (query.isError) {
    return (
      <ErrorState
        title="告警历史加载失败"
        message="无法获取告警历史记录，请稍后重试。"
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
        <div className="text-xs text-muted-foreground">共 {history.length} 条历史记录</div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={event}
            onValueChange={(value: "all" | TenantAlertEvent) => setEvent(value)}
          >
            <SelectTrigger className="w-[140px] cursor-pointer">
              <SelectValue placeholder="事件" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                全部事件
              </SelectItem>
              {TENANT_ALERT_EVENTS.map((item) => (
                <SelectItem key={item} value={item} className="cursor-pointer">
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={type}
            onValueChange={(value: "all" | (typeof TENANT_ALERT_TYPES)[number]) => setType(value)}
          >
            <SelectTrigger className="w-[140px] cursor-pointer">
              <SelectValue placeholder="类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                全部类型
              </SelectItem>
              {TENANT_ALERT_TYPES.map((item) => (
                <SelectItem key={item} value={item} className="cursor-pointer">
                  {formatAlertType(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={status}
            onValueChange={(value: "all" | TenantAlertStatus) => setStatus(value)}
          >
            <SelectTrigger className="w-[140px] cursor-pointer">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="cursor-pointer">
                全部状态
              </SelectItem>
              {TENANT_ALERT_STATUSES.map((item) => (
                <SelectItem key={item} value={item} className="cursor-pointer">
                  {formatAlertStatus(item)}
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

      {history.length === 0 ? (
        <EmptyState
          icon={History}
          title="暂无告警历史"
          description="当前筛选条件下没有历史事件记录。"
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border/50">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>事件</TableHead>
                <TableHead>告警 ID</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>范围</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>时间</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>详情</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => (
                <TableRow key={item.historyId}>
                  <TableCell>{item.event}</TableCell>
                  <TableCell className="font-mono text-xs">{item.alertId}</TableCell>
                  <TableCell>{formatAlertType(item.type)}</TableCell>
                  <TableCell className="max-w-[220px] truncate text-muted-foreground text-xs">
                    {item.scopeName}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`border px-2 py-0.5 text-xs ${getStatusBadgeClassName(item.status)}`}
                    >
                      {formatAlertStatus(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatDateTime(item.happenedAt)}
                  </TableCell>
                  <TableCell className="text-xs">{item.actor}</TableCell>
                  <TableCell className="max-w-[320px] truncate text-xs text-muted-foreground">
                    {item.detail}
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
