import { Lock } from "lucide-react"
import { useMemo } from "react"
import { PERMISSIONS } from "@/config/permissions"
import { usePermission } from "@/features/core/auth/use-permission"
import { type LogEntry, LogViewer } from "@/features/shared/components"
import type { ProjectServiceDetail } from "../../types"

interface ServiceLogsTabProps {
  service: ProjectServiceDetail
}

export function ServiceLogsTab({ service }: ServiceLogsTabProps) {
  const permission = usePermission(
    PERMISSIONS.DASHBOARD_VIEW,
    service.env === "Prod"
      ? {
          prodRestriction: {
            enabledInProd: false,
            reason: "该环境下日志仅对 Developer/Owner 开放。",
          },
        }
      : {},
  )

  const streamSource = useMemo(() => {
    if (!permission.canAccess || service.desiredState !== "Active") {
      return undefined
    }

    return {
      connect: (onMessage: (entry: LogEntry) => void) => {
        const timer = window.setInterval(() => {
          onMessage({
            id: `stream-${Math.random().toString(36).slice(2, 8)}`,
            timestamp: new Date().toISOString(),
            level: Math.random() > 0.85 ? "warn" : "info",
            message: `stream heartbeat revision=${service.revisions[0]?.revisionId ?? "-"}`,
            instance: `${service.name}-pod-${Math.floor(Math.random() * 4) + 1}`,
            revision: service.revisions[0]?.revisionId ?? "-",
          })
        }, 4000)
        return () => {
          window.clearInterval(timer)
        }
      },
    }
  }, [permission.canAccess, service.desiredState, service.name, service.revisions])

  if (!permission.canAccess) {
    return (
      <div className="rounded-lg border border-border/50 bg-card p-6">
        <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/20 p-4">
          <Lock className="size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">日志访问受限</p>
            <p className="text-xs text-muted-foreground">
              {permission.reason || "当前策略禁止查看日志。"}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <LogViewer
      logs={service.logs}
      {...(streamSource ? { streamSource } : {})}
      className="bg-card"
      emptyText="暂无日志输出"
    />
  )
}
