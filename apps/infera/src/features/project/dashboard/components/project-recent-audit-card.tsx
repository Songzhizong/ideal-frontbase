import { ArrowUpRight, FileClock } from "lucide-react"
import { buildProjectPath } from "@/components/workspace/workspace-context"
import { EmptyState } from "@/features/shared/components"
import { BaseLink } from "@/packages/platform-router"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/ui/card"
import type { ProjectDashboardAuditEvent } from "../types/project-dashboard"
import { formatDateTime } from "../utils/project-dashboard-formatters"

interface ProjectRecentAuditCardProps {
  tenantId: string
  projectId: string
  events: readonly ProjectDashboardAuditEvent[]
}

export function ProjectRecentAuditCard({
  tenantId,
  projectId,
  events,
}: ProjectRecentAuditCardProps) {
  const auditPath = buildProjectPath(tenantId, projectId, "/audit")

  return (
    <Card className="border-border/50 py-0 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-2 border-b border-border/50 px-4 py-4">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold tracking-tight">最近审计事件</CardTitle>
          <CardDescription>记录项目级关键写操作，便于快速追溯</CardDescription>
        </div>
        <BaseLink
          to={auditPath}
          className="inline-flex cursor-pointer items-center gap-1 text-xs text-primary transition-colors duration-150 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          查看审计
          <ArrowUpRight className="size-3.5" aria-hidden />
        </BaseLink>
      </CardHeader>

      <CardContent className="px-0 py-0">
        {events.length === 0 ? (
          <div className="px-4 py-4">
            <EmptyState
              icon={FileClock}
              title="暂无审计事件"
              description="当前时间范围内还没有新的项目操作记录。"
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
