import {
  Activity,
  ArrowRight,
  Coins,
  Copy,
  ExternalLink,
  Gauge,
  Layers,
  Logs,
  MoreHorizontal,
  Settings2,
  Trash2,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { buildProjectPath } from "@/components/workspace/workspace-context"
import { TenantProjectEnvironmentBadge } from "@/features/tenant/projects"
import { BaseLink } from "@/packages/platform-router"
import { Avatar, AvatarFallback } from "@/packages/ui/avatar"
import { Button } from "@/packages/ui/button"
import {
  Card,
  CardAction,
  CardContent,
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
import { buildTokenTrendSeries, TokenSparkline } from "./tenant-project-card-trend"

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
  onOpenLogs: (project: TenantProjectItem) => void
  onRequestDelete: (project: TenantProjectItem) => void
}

export function TenantProjectCard({
  tenantId,
  project,
  canManageProject,
  onOpenSettings,
  onOpenLogs,
  onRequestDelete,
}: TenantProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [copied, setCopied] = useState(false)

  const dashboardPath = buildProjectPath(tenantId, project.projectId, "/dashboard")
  const ready = project.serviceSummary.ready
  const total = project.serviceSummary.total
  const progress = total > 0 ? Math.min(100, Math.max(0, (ready / total) * 100)) : 0
  const isHealthy = total > 0 && ready === total

  const progressToneClassName =
    ready === total
      ? "[&_[data-slot=progress-indicator]]:bg-emerald-500"
      : ready > 0
        ? "[&_[data-slot=progress-indicator]]:bg-amber-500"
        : "[&_[data-slot=progress-indicator]]:bg-destructive"

  const summaryToneClassName =
    ready === total ? "text-emerald-500" : ready > 0 ? "text-amber-500" : "text-destructive"

  const tokenTrendSeries = useMemo(
    () => buildTokenTrendSeries(project.tokensToday, project.projectId),
    [project.projectId, project.tokensToday],
  )

  useEffect(() => {
    if (!copied) {
      return
    }

    const timer = window.setTimeout(() => {
      setCopied(false)
    }, 1300)

    return () => {
      window.clearTimeout(timer)
    }
  }, [copied])

  const handleCopyProjectId = async () => {
    try {
      await navigator.clipboard.writeText(project.projectId)
      setCopied(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "复制失败，请稍后重试。")
    }
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      <Card className="relative gap-2 overflow-hidden border-border/50 bg-gradient-to-br from-background via-background to-primary/5 pt-4 pb-3 shadow-md backdrop-blur supports-[backdrop-filter]:bg-background/75 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-border hover:shadow-xl">
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-amber-500/10 opacity-0"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
        />

        <CardHeader className="relative z-10 gap-2 px-4 pb-0">
          <div className="space-y-1.5">
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

            <div className="relative min-h-5 text-[11px]">
              <AnimatePresence mode="wait" initial={false}>
                {isHovered || copied ? (
                  <motion.button
                    key="project-id-real"
                    type="button"
                    onClick={handleCopyProjectId}
                    className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-muted-foreground transition-colors duration-200 hover:text-foreground"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    <Copy className="size-3" aria-hidden />
                    {copied ? "已复制" : `ID ${project.projectId}`}
                  </motion.button>
                ) : (
                  <motion.p
                    key="project-id-masked"
                    className="font-mono text-muted-foreground/60"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    ID 已弱化展示
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
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
                <DropdownMenuItem
                  onClick={() => onOpenSettings(project)}
                  className="cursor-pointer"
                >
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

        <CardContent className="relative z-10 space-y-2.5 px-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border/60 bg-background/60 px-3 py-2">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Coins className="size-3.5" aria-hidden />
                本月预估
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {formatCurrency(project.monthlyEstimatedCostCny)}
              </p>
            </div>

            <div className="rounded-lg border border-border/60 bg-background/60 px-3 py-2">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Activity className="size-3.5" aria-hidden />
                今日 Tokens
              </p>
              <div className="mt-1 flex items-end justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">
                  {formatTokenCount(project.tokensToday)}
                </p>
                <TokenSparkline points={tokenTrendSeries} />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Layers className="size-3.5" aria-hidden />
                服务就绪
              </span>
              <span className={cn("flex items-center gap-1.5 font-mono", summaryToneClassName)}>
                {isHealthy ? (
                  <motion.span
                    className="inline-flex size-2 rounded-full bg-emerald-500"
                    animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.18, 1] }}
                    transition={{
                      duration: 1.8,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                ) : null}
                {isHealthy ? "Healthy" : `${ready}/${total}`}
              </span>
            </div>

            <div className="relative">
              <Progress
                value={progress}
                className={cn("h-2.5 bg-muted/60", progressToneClassName)}
              />
              {progress > 0 ? (
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-[-38%] w-[34%] bg-gradient-to-r from-transparent via-background/55 to-transparent"
                  animate={{ x: ["0%", "320%"] }}
                  transition={{
                    duration: 2.4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
              ) : null}
            </div>
          </div>
        </CardContent>

        <CardFooter className="relative z-10 mt-auto items-center justify-between border-t border-border/50 px-4 py-2.5">
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

      <AnimatePresence>
        {isHovered ? (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="pointer-events-none absolute inset-x-3 bottom-0 z-20 pb-3"
          >
            <div className="pointer-events-auto rounded-xl border border-border/50 bg-background/80 p-2 shadow-lg backdrop-blur-md supports-[backdrop-filter]:bg-background/65">
              <div className="grid grid-cols-3 gap-1.5">
                <Button
                  asChild
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="cursor-pointer"
                >
                  <BaseLink to={dashboardPath}>
                    <Gauge className="size-3.5" aria-hidden />
                    监控详情
                  </BaseLink>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => onOpenSettings(project)}
                >
                  <Settings2 className="size-3.5" aria-hidden />
                  配置中心
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => onOpenLogs(project)}
                >
                  <Logs className="size-3.5" aria-hidden />
                  控制台日志
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  )
}

export function TenantProjectCardSkeleton() {
  return (
    <Card className="gap-4 overflow-hidden border-border/50 bg-gradient-to-br from-background via-background to-primary/5 py-4">
      <CardHeader className="px-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </CardHeader>
      <CardContent className="space-y-3 px-4">
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-18 rounded-lg" />
          <Skeleton className="h-18 rounded-lg" />
        </div>
        <Skeleton className="h-2.5 w-full" />
      </CardContent>
      <CardFooter className="justify-between border-t border-border/50 px-4 pt-4">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-12" />
      </CardFooter>
    </Card>
  )
}
