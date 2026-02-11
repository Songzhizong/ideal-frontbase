import { AlertTriangle, ArrowUpRight, ExternalLink, ShieldCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { buildProjectPath } from "@/components/workspace/workspace-context"
import { BaseLink } from "@/packages/platform-router"
import { Badge } from "@/packages/ui/badge"
import { Button } from "@/packages/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/ui/card"
import { cn } from "@/packages/ui-utils"
import type { ProjectAlertSeverity, ProjectDashboardAlertItem } from "../types/project-dashboard"
import {
  formatAlertSeverity,
  formatDateTime,
  getAlertSeverityClassName,
} from "../utils/project-dashboard-formatters"

interface ProjectActiveAlertsCardProps {
  tenantId: string
  projectId: string
  alerts: readonly ProjectDashboardAlertItem[]
  ackLoading: boolean
  onAckAlert: (alertId: string) => Promise<void>
}

const SEVERITY_CARD_STYLES: Record<ProjectAlertSeverity, string> = {
  Critical: "bg-destructive/5 border-destructive/20 ring-1 ring-destructive/10",
  High: "bg-error-subtle/30 border-error/20",
  Medium: "bg-warning-subtle/30 border-warning/20",
  Low: "bg-info-subtle/30 border-info/20",
}

const SEVERITY_SIDE_BAR: Record<ProjectAlertSeverity, string> = {
  Critical: "bg-destructive",
  High: "bg-error",
  Medium: "bg-warning",
  Low: "bg-info",
}

export function ProjectActiveAlertsCard({
  tenantId,
  projectId,
  alerts,
  ackLoading,
  onAckAlert,
}: ProjectActiveAlertsCardProps) {
  const [lastChecked, setLastChecked] = useState<string>("")
  const servicesPath = buildProjectPath(tenantId, projectId, "/services")

  useEffect(() => {
    // 模拟最后检查时间，实际应用中可以从后端或全局状态获取
    const now = new Date()
    setLastChecked(now.toLocaleTimeString("zh-CN", { hour12: false }))
  }, [])

  const isEmpty = alerts.length === 0

  return (
    <Card className="flex h-full flex-col overflow-hidden border-border/50 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/50 bg-muted/5 px-6 py-4">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold tracking-tight">活跃告警</CardTitle>
          {!isEmpty && (
            <CardDescription className="text-xs">
              系统异常提醒，可在看板内通过 Ack 快速确认
            </CardDescription>
          )}
        </div>
        <BaseLink
          to={servicesPath}
          className="group inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          前往服务
          <ArrowUpRight
            className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden
          />
        </BaseLink>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col px-6 py-5">
        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-4 py-8">
            <div className="relative">
              {/* 呼吸晕染效果背景 */}
              <div className="absolute inset-0 animate-pulse rounded-full bg-success/20 blur-xl" />
              <div className="relative flex size-16 items-center justify-center rounded-2xl bg-success/10 text-success shadow-[0_0_20px_rgba(34,197,94,0.15)] ring-1 ring-success/20">
                <ShieldCheck className="size-8" strokeWidth={1.5} />
              </div>
            </div>

            <div className="space-y-1.5 text-center">
              <h3 className="text-sm font-bold text-foreground">暂无活跃告警</h3>
              <p className="max-w-[200px] text-[11px] leading-relaxed text-muted-foreground/80">
                安全监控运行中，当前系统状态平稳。
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-success/20 bg-success/5 px-3 py-1 shadow-xs">
              <div className="size-1.5 animate-pulse rounded-full bg-success ring-2 ring-success/20" />
              <span className="text-[10px] font-medium text-success/80">
                最后检查: {lastChecked}
              </span>
            </div>
          </div>
        ) : (
          <ul className="space-y-4">
            {alerts.map((alert) => (
              <li
                key={alert.alertId}
                className={cn(
                  "relative overflow-hidden rounded-xl border p-4 transition-all hover:shadow-sm",
                  SEVERITY_CARD_STYLES[alert.severity] || "bg-card border-border/50",
                )}
              >
                {/* 装饰侧条 */}
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 w-1",
                    SEVERITY_SIDE_BAR[alert.severity] || "bg-muted",
                  )}
                />

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-2 py-0.5 text-[10px] font-bold shadow-xs whitespace-nowrap",
                          getAlertSeverityClassName(alert.severity),
                        )}
                      >
                        {formatAlertSeverity(alert.severity)}
                      </Badge>
                      <span className="truncate text-[11px] font-medium text-muted-foreground/80">
                        {alert.resourceType} · {alert.resourceName}
                      </span>
                    </div>

                    <div className="relative group/title">
                      <h4 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                        <span className="truncate">{alert.name}</span>
                        <BaseLink
                          to={servicesPath}
                          className="text-muted-foreground/20 transition-colors hover:text-primary/60 focus-visible:text-primary/60 focus-visible:outline-none shrink-0"
                          title="跳转到详情"
                        >
                          <ExternalLink className="size-3.5" aria-hidden />
                        </BaseLink>
                      </h4>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground/90">
                        {alert.summary}
                      </p>
                    </div>

                    <div className="text-[10px] font-medium text-muted-foreground/50 tabular-nums">
                      {formatDateTime(alert.triggeredAt)}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center self-center sm:self-start">
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 px-3 text-xs font-bold shadow-sm cursor-pointer"
                      onClick={() => {
                        void onAckAlert(alert.alertId)
                      }}
                      disabled={ackLoading || alert.status !== "Open"}
                    >
                      Ack
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {alerts.length > 0 ? (
          <div className="mt-5 space-y-4">
            <div className="flex items-start gap-2 rounded-lg bg-muted/30 p-3">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" aria-hidden />
              <p className="text-[11px] leading-relaxed text-muted-foreground/80">
                确认告警（Ack）后，系统将自动标记该异常已开始处理。数据更新可能存在短暂延迟。
              </p>
            </div>

            <Button
              asChild
              variant="ghost"
              size="sm"
              className="w-full text-xs font-medium text-muted-foreground hover:bg-muted/50"
            >
              <BaseLink to={servicesPath} className="flex items-center justify-center gap-1.5">
                查看历史告警
                <ArrowUpRight className="size-3" aria-hidden />
              </BaseLink>
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
