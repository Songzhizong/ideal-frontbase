import { ArrowUpRight, Boxes, Copy, ExternalLink, RefreshCcw, Rocket } from "lucide-react"
import { toast } from "sonner"
import { buildProjectPath } from "@/components/workspace/workspace-context"
import { EmptyState } from "@/features/shared/components"
import { BaseLink } from "@/packages/platform-router"
import { Avatar, AvatarFallback } from "@/packages/ui/avatar"
import { Button } from "@/packages/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/packages/ui/tooltip"
import { cn } from "@/packages/ui-utils"
import type {
  ProjectDashboardDeploymentItem,
  ProjectDeploymentResult,
} from "../types/project-dashboard"
import { formatRelativeTime, getDeploymentResultLabel } from "../utils/project-dashboard-formatters"

interface ProjectRecentDeploymentsCardProps {
  tenantId: string
  projectId: string
  deployments: readonly ProjectDashboardDeploymentItem[]
}

function _toStatus(result: ProjectDeploymentResult) {
  switch (result) {
    case "Succeeded":
      return "Succeeded" as const
    case "Failed":
      return "Failed" as const
    case "RollingBack":
      return "Running" as const
    default:
      return "Pending" as const
  }
}

function getOperatorInitial(email: string | undefined) {
  if (!email) return "U"
  const name = email.split("@")[0]
  if (!name) return "U"
  return name.slice(0, 2).toUpperCase()
}

export function ProjectRecentDeploymentsCard({
  tenantId,
  projectId,
  deployments,
}: ProjectRecentDeploymentsCardProps) {
  const servicesPath = buildProjectPath(tenantId, projectId, "/services")

  return (
    <Card className="flex h-full flex-col overflow-hidden border-border/50 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/50 bg-muted/5 px-6 py-4">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold tracking-tight">最近部署</CardTitle>
          <CardDescription className="text-xs">展示最新服务发布状况及执行动态</CardDescription>
        </div>
        <BaseLink
          to={servicesPath}
          className="group inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          查看全部
          <ArrowUpRight
            className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden
          />
        </BaseLink>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        {deployments.length === 0 ? (
          <div className="px-6 py-12">
            <EmptyState
              icon={Rocket}
              title="暂无部署记录"
              description="当前时间范围内还没有新的服务部署。"
            />
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {deployments.map((item) => (
              <li
                key={item.id}
                className="group/row flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-muted/30"
              >
                {/* Left: Service Info */}
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground ring-1 ring-border/50 transition-all group-hover/row:bg-primary/10 group-hover/row:text-primary group-hover/row:ring-primary/20">
                    <Boxes className="size-5" aria-hidden />
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <BaseLink
                      to={servicesPath}
                      className="truncate text-sm font-bold text-foreground transition-colors hover:text-primary leading-snug"
                    >
                      {item.serviceName}
                    </BaseLink>
                    <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-muted-foreground/60">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => {
                                void navigator.clipboard.writeText(item.revisionId)
                                toast.success("修订版本 ID 已复制")
                              }}
                              className="group/rev inline-flex items-center gap-1 font-mono transition-colors hover:text-primary"
                            >
                              {item.revisionId.slice(0, 8)}
                              <Copy className="size-2.5 opacity-0 transition-opacity group-hover/rev:opacity-100" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-[10px]">
                            点击复制修订版本 ID: {item.revisionId}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span className="opacity-40">·</span>
                      <div className="flex items-center gap-1.5">
                        <Avatar className="size-4.5 border border-border/40">
                          <AvatarFallback className="bg-primary/5 text-[8px] font-bold text-primary/80">
                            {getOperatorInitial(item.operator)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate max-w-[80px]">{item.operator.split("@")[0]}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Status & Time & Actions */}
                <div className="flex shrink-0 items-center gap-4">
                  {/* Hover Actions - Only show on large enough screens or when hovered */}
                  <div className="hidden items-center gap-1 opacity-0 transition-all group-hover/row:opacity-100 sm:flex">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                          >
                            <ExternalLink className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="text-[10px]">查看日志</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                          >
                            <RefreshCcw className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="text-[10px]">重新部署</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="flex flex-col items-end gap-1 text-right">
                    {item.result === "Succeeded" ? (
                      <div className="flex items-center gap-1.5">
                        <div className="relative flex size-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-20" />
                          <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <span className="text-[11px] font-bold text-emerald-600/90 whitespace-nowrap">
                          成功
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div
                          className={cn(
                            "size-1.5 rounded-full",
                            item.result === "Failed"
                              ? "bg-destructive"
                              : "bg-blue-500 animate-pulse",
                          )}
                        />
                        <span
                          className={cn(
                            "text-[11px] font-bold whitespace-nowrap",
                            item.result === "Failed" ? "text-destructive/90" : "text-blue-600/90",
                          )}
                        >
                          {getDeploymentResultLabel(item.result)}
                        </span>
                      </div>
                    )}
                    <span className="text-[10px] tabular-nums text-muted-foreground/50">
                      {formatRelativeTime(item.deployedAt)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
