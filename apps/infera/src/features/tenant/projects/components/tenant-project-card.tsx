import {
  Activity,
  ArrowRight,
  Coins,
  ExternalLink,
  Layers,
  MoreHorizontal,
  Plus,
  Settings2,
  Trash2,
} from "lucide-react"
import { buildProjectPath } from "@/components/workspace/workspace-context"
import { TenantProjectEnvironmentBadge } from "@/features/tenant/projects"
import { BaseLink } from "@/packages/platform-router"
import { Avatar, AvatarFallback } from "@/packages/ui/avatar"
import { Button } from "@/packages/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/packages/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/packages/ui/dropdown-menu"
import { Progress } from "@/packages/ui/progress"
import { Skeleton } from "@/packages/ui/skeleton"
import { cn } from "@/packages/ui-utils"
import type { TenantProjectItem } from "../types/tenant-projects"
import {
  formatCurrency,
  formatDateTime,
  formatTokenCount,
} from "../utils/tenant-projects-formatters"

function toOwnerInitial(name: string) {
  const normalized = name.trim()
  if (normalized.length === 0) {
    return "?"
  }
  return normalized.slice(0, 1).toUpperCase()
}

interface TenantProjectCardProps {
  tenantId: string
  project: TenantProjectItem
  canManageProject: boolean
  onOpenSettings: (project: TenantProjectItem) => void
  onRequestDelete: (project: TenantProjectItem) => void
}

export function TenantProjectCard({
  tenantId,
  project,
  canManageProject,
  onOpenSettings,
  onRequestDelete,
}: TenantProjectCardProps) {
  const dashboardPath = buildProjectPath(tenantId, project.projectId, "/dashboard")
  const ready = project.serviceSummary.ready
  const total = project.serviceSummary.total
  const progress = total > 0 ? Math.min(100, Math.max(0, (ready / total) * 100)) : 0
  const progressToneClassName =
    ready === total
      ? "[&_[data-slot=progress-indicator]]:bg-emerald-500"
      : ready > 0
        ? "[&_[data-slot=progress-indicator]]:bg-amber-500"
        : "[&_[data-slot=progress-indicator]]:bg-destructive"

  const summaryToneClassName =
    ready === total ? "text-emerald-500" : ready > 0 ? "text-amber-500" : "text-destructive"

  return (
    <Card className="group relative overflow-hidden border-border/60 bg-card/80 pt-4 pb-3 gap-2 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md">
      <CardHeader className="gap-2 px-4 pb-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className="min-w-0 text-base">
              <BaseLink
                to={dashboardPath}
                className="line-clamp-1 cursor-pointer transition-colors hover:text-primary"
              >
                {project.projectName}
              </BaseLink>
            </CardTitle>
            <TenantProjectEnvironmentBadge environment={project.environment} />
          </div>
          <CardDescription className="font-mono text-xs">ID: {project.projectId}</CardDescription>
        </div>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-8 cursor-pointer data-[state=open]:bg-muted"
              >
                <span className="sr-only">项目操作</span>
                <MoreHorizontal className="size-4" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-42">
              <DropdownMenuLabel>项目操作</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <BaseLink to={dashboardPath} className="cursor-pointer">
                  <ExternalLink className="size-4" aria-hidden />
                  进入项目
                </BaseLink>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onOpenSettings(project)} className="cursor-pointer">
                <Settings2 className="size-4" aria-hidden />
                设置
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onRequestDelete(project)}
                disabled={!canManageProject}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden />
                删除项目
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-2.5 px-4 py-2">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Coins className="size-3.5" aria-hidden />
              本月预估
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {formatCurrency(project.monthlyEstimatedCostCny)}
            </p>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Activity className="size-3.5" aria-hidden />
              今日 Tokens
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {formatTokenCount(project.tokensToday)}
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Layers className="size-3.5" aria-hidden />
              服务就绪
            </span>
            <span className={cn("font-mono", summaryToneClassName)}>
              {ready}/{total}
            </span>
          </div>
          <Progress value={progress} className={cn("h-2 bg-muted/60", progressToneClassName)} />
        </div>
      </CardContent>
      <CardFooter className="mt-auto items-center justify-between border-t border-border/50 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar size="sm">
            <AvatarFallback>{toOwnerInitial(project.ownerName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-foreground">{project.ownerName}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              更新于 {formatDateTime(project.updatedAt)}
            </p>
          </div>
        </div>
        <Button
          asChild
          type="button"
          size="icon-sm"
          variant="ghost"
          className="cursor-pointer text-muted-foreground hover:text-primary"
        >
          <BaseLink to={dashboardPath}>
            <ArrowRight className="size-4" aria-hidden />
          </BaseLink>
        </Button>
      </CardFooter>
    </Card>
  )
}

export function TenantProjectCardSkeleton() {
  return (
    <Card className="gap-4 overflow-hidden border-border/60 bg-card/80 py-4">
      <CardHeader className="px-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </CardHeader>
      <CardContent className="space-y-3 px-4">
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-18 rounded-lg" />
          <Skeleton className="h-18 rounded-lg" />
        </div>
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
      <CardFooter className="justify-between border-t border-border/50 px-4 pt-4">
        <Skeleton className="h-8 w-26" />
        <Skeleton className="h-8 w-24" />
      </CardFooter>
    </Card>
  )
}

interface CreateProjectPlaceholderCardProps {
  onClick: () => void
}

export function CreateProjectPlaceholderCard({ onClick }: CreateProjectPlaceholderCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-65 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-background/30 p-6 text-center transition-all duration-200 hover:border-primary/50 hover:bg-primary/5"
    >
      <span className="inline-flex size-11 items-center justify-center rounded-full border border-border/50 bg-card text-muted-foreground transition-colors group-hover:text-primary">
        <Plus className="size-5" aria-hidden />
      </span>
      <p className="mt-3 text-sm font-medium text-foreground">创建新项目</p>
      <p className="mt-1 max-w-45 text-xs text-muted-foreground">配置环境、配额策略和初始成员。</p>
    </button>
  )
}
