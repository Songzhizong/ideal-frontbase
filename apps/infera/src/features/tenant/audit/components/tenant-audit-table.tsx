import { Button } from "@/packages/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import { formatTimestampToDateTime } from "@/packages/ui-utils/time-utils"
import type { TenantAuditActorType, TenantAuditLogItem } from "../types/tenant-audit"

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const

interface TenantAuditTableProps {
  rows: readonly TenantAuditLogItem[]
  page: number
  totalPages: number
  size: (typeof PAGE_SIZE_OPTIONS)[number]
  pageRangeLabel: string
  onPageChange: (nextPage: number) => void
  onSizeChange: (nextSize: (typeof PAGE_SIZE_OPTIONS)[number]) => void
  onViewDetail: (logId: string) => void
}

function formatActorTypeLabel(type: TenantAuditActorType) {
  if (type === "service_account") {
    return "服务账号"
  }
  return "用户"
}

function ActorCell({ item }: { item: TenantAuditLogItem }) {
  return (
    <div className="space-y-1 py-1">
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-border/50 bg-muted/60 px-2 py-0.5 text-xs text-muted-foreground">
          {formatActorTypeLabel(item.actorType)}
        </span>
        <span className="text-sm font-medium text-foreground">{item.actorName ?? "-"}</span>
      </div>
      <p className="text-xs text-muted-foreground">{item.actorEmail}</p>
    </div>
  )
}

function ResourceCell({ item }: { item: TenantAuditLogItem }) {
  return (
    <div className="space-y-1 py-1">
      <p className="text-sm font-medium text-foreground">{item.resourceType}</p>
      <p className="font-mono text-xs text-muted-foreground">{item.resourceId}</p>
    </div>
  )
}

export function TenantAuditTable({
  rows,
  page,
  totalPages,
  size,
  pageRangeLabel,
  onPageChange,
  onSizeChange,
  onViewDetail,
}: TenantAuditTableProps) {
  const canPrev = page > 1
  const canNext = page < totalPages

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-border/50">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                时间
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Actor
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Action
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Resource
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Project
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                IP
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                User-Agent
              </TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                操作
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((item) => (
              <TableRow key={item.logId} className="hover:bg-muted/50 transition-colors">
                <TableCell className="text-xs tabular-nums text-muted-foreground">
                  {formatTimestampToDateTime(item.happenedAtMs)}
                </TableCell>
                <TableCell>
                  <ActorCell item={item} />
                </TableCell>
                <TableCell>
                  <span className="rounded bg-muted px-2 py-1 font-mono text-xs text-foreground">
                    {item.action}
                  </span>
                </TableCell>
                <TableCell>
                  <ResourceCell item={item} />
                </TableCell>
                <TableCell className="text-sm">{item.projectName ?? "-"}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {item.ip ?? "-"}
                </TableCell>
                <TableCell>
                  <p
                    className="max-w-[220px] truncate text-xs text-muted-foreground"
                    title={item.userAgent ?? "-"}
                  >
                    {item.userAgent ?? "-"}
                  </p>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetail(item.logId)}
                    className="cursor-pointer"
                  >
                    查看详情
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 bg-card px-4 py-3">
        <p className="text-xs text-muted-foreground">当前显示 {pageRangeLabel}</p>
        <div className="flex items-center gap-2">
          <Select
            value={String(size)}
            onValueChange={(value) => {
              if (value === "10" || value === "20" || value === "50") {
                onSizeChange(Number(value) as (typeof PAGE_SIZE_OPTIONS)[number])
              }
            }}
          >
            <SelectTrigger className="h-8 w-[110px] cursor-pointer text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)} className="cursor-pointer">
                  {option} / 页
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={!canPrev}
            className="cursor-pointer"
          >
            上一页
          </Button>
          <span className="font-mono text-xs text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={!canNext}
            className="cursor-pointer"
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  )
}
