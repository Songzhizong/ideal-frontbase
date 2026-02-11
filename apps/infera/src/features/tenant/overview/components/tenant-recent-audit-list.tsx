import { ArrowUpRight, FileClock } from "lucide-react"
import { buildTenantPath } from "@/components/workspace/workspace-context"
import { EmptyState } from "@/features/shared/components"
import { BaseLink } from "@/packages/platform-router"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/ui/card"
import type { TenantOverviewAuditEvent } from "../types/tenant-overview"
import { formatDateTime } from "../utils/tenant-overview-formatters"

interface TenantRecentAuditListProps {
  tenantId: string
  events: readonly TenantOverviewAuditEvent[]
}

export function TenantRecentAuditList({ tenantId, events }: TenantRecentAuditListProps) {
  const auditPath = buildTenantPath(tenantId, "/audit")

  return (
    <Card className="border-border/50 py-0">
      <CardHeader className="space-y-1 border-b border-border/50 px-4 py-4">
        <CardTitle className="text-sm font-semibold">最近审计事件</CardTitle>
        <CardDescription>最近发生的关键写操作事件</CardDescription>
      </CardHeader>
      <CardContent className="px-0 py-0">
        {events.length === 0 ? (
          <div className="px-4 py-4">
            <EmptyState
              icon={FileClock}
              title="暂无审计事件"
              description="当前时间范围内没有可展示的审计记录。"
            />
          </div>
        ) : (
          <ul className="divide-y divide-border/50">
            {events.map((event) => (
              <li key={event.id}>
                <BaseLink
                  to={auditPath}
                  className="group flex cursor-pointer items-center justify-between gap-3 px-4 py-3 transition-colors duration-200 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-sm text-foreground">
                      <span className="font-semibold">{event.actor}</span>
                      <span className="mx-1 text-muted-foreground">执行了</span>
                      <span className="font-mono text-xs">{event.action}</span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {event.resourceType} · {event.resourceName}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {formatDateTime(event.happenedAt)}
                    </span>
                    <ArrowUpRight className="size-3.5 text-muted-foreground transition-colors duration-150 group-hover:text-foreground" />
                  </div>
                </BaseLink>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
