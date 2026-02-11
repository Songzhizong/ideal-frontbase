import { ChevronRight, FolderKanban, TrendingDown, TrendingUp } from "lucide-react"
import { buildProjectPath } from "@/components/workspace/workspace-context"
import { EmptyState } from "@/features/shared/components"
import { BaseLink } from "@/packages/platform-router"
import { Badge } from "@/packages/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import { cn } from "@/packages/ui-utils"
import type {
  TenantOverviewProjectCostItem,
  TenantProjectEnvironment,
} from "../types/tenant-overview"

interface TenantTopProjectsTableProps {
  tenantId: string
  projects: readonly TenantOverviewProjectCostItem[]
}

const ENVIRONMENT_BADGE_CLASSNAME: Readonly<Record<TenantProjectEnvironment, string>> = {
  Dev: "border-sky-200/50 bg-sky-500/15 text-sky-700 dark:text-sky-400 dark:border-sky-700/50",
  Test: "border-amber-200/50 bg-amber-500/15 text-amber-700 dark:text-amber-400 dark:border-amber-700/50",
  Prod: "border-emerald-200/50 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 dark:border-emerald-700/50",
}

function EnvironmentBadge({ environment }: { environment: TenantProjectEnvironment }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
        ENVIRONMENT_BADGE_CLASSNAME[environment],
      )}
    >
      {environment}
    </Badge>
  )
}

function TrendIndicator({ change }: { change: number | undefined }) {
  if (change === undefined || change === 0) return null
  const isIncrease = change > 1e-6 // 处理浮点数精度
  const Icon = isIncrease ? TrendingUp : TrendingDown
  const percentage = Math.abs(change * 100).toFixed(1)

  // 统一逻辑：上升为红（预警），下降为绿（好转）
  return (
    <span
      className={cn(
        "ml-1 inline-flex items-center gap-0.5 text-[10px] font-medium transition-colors",
        isIncrease ? "text-red-500" : "text-emerald-500",
      )}
    >
      <Icon className="h-2.5 w-2.5" />
      {percentage}%
    </span>
  )
}

export function TenantTopProjectsTable({ tenantId, projects }: TenantTopProjectsTableProps) {
  const maxCost = Math.max(...projects.map((p) => p.monthlyEstimatedCostCny), 1)

  return (
    <Card className="h-full border-border/50 py-0">
      <CardHeader className="space-y-1.5 border-b border-border/50 px-6 py-5">
        <CardTitle className="text-lg font-bold tracking-tight">项目成本 Top 5</CardTitle>
        <CardDescription className="text-xs">基于当前计费周期的预估消耗排名</CardDescription>
      </CardHeader>
      <CardContent className="px-0 py-0">
        {projects.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={FolderKanban}
              title="暂无项目成本数据"
              description="当前租户下没有可展示的项目成本。"
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border/40 bg-muted/30">
                <TableHead className="h-12 pl-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground/90">
                  项目名称
                </TableHead>
                <TableHead className="h-12 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground/90">
                  本月预估 (元)
                </TableHead>
                <TableHead className="h-12 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground/90">
                  今日消耗 (万)
                </TableHead>
                <TableHead className="h-12 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground/90">
                  活跃服务
                </TableHead>
                <TableHead className="h-12 w-10 pr-6" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => {
                const costRatio = (project.monthlyEstimatedCostCny / maxCost) * 100
                return (
                  <TableRow
                    key={project.projectId}
                    className="group h-16 border-b border-border/30 transition-all duration-200 hover:bg-muted/40"
                  >
                    <TableCell className="pl-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <EnvironmentBadge environment={project.environment} />
                          <BaseLink
                            to={buildProjectPath(tenantId, project.projectId, "/dashboard")}
                            className="w-fit text-sm font-bold text-foreground transition-colors hover:text-primary focus-visible:outline-none"
                          >
                            {project.projectName}
                          </BaseLink>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-50">
                          <span className="font-mono text-[9px] font-bold tracking-widest">
                            {project.projectId.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="relative p-0 text-right">
                      {/* Ultra-fine status indicator - 2px height with visible track */}
                      <div className="absolute bottom-3 right-4 h-0.5 w-[calc(100%-1rem)] bg-muted/30" />
                      <div
                        className="absolute bottom-3 right-4 h-0.5 bg-primary transition-all duration-700 ease-out"
                        style={{ width: `calc(${costRatio}% - 1rem)`, borderRadius: "1px" }}
                      />
                      <div className="relative flex flex-col items-end gap-1 pb-4 pr-4">
                        <span className="text-sm font-bold tabular-nums text-foreground">
                          {project.monthlyEstimatedCostCny.toLocaleString("zh-CN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium text-muted-foreground/40">
                            占比 {costRatio.toFixed(0)}%
                          </span>
                          <div className="min-w-12 flex justify-end">
                            <TrendIndicator change={project.costTrendChange} />
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-sm font-bold tabular-nums text-foreground">
                          {(project.tokensToday / 10000).toLocaleString("zh-CN", {
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1,
                          })}
                        </span>
                        <div className="min-w-12 flex justify-end">
                          <TrendIndicator change={project.tokensTrendChange} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        <div
                          className={cn(
                            "flex items-center gap-1.5 tabular-nums font-bold",
                            project.readyServiceCount === project.totalServiceCount
                              ? "text-emerald-600 dark:text-emerald-400"
                              : project.readyServiceCount > 0
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-red-600 dark:text-red-400",
                          )}
                        >
                          <div
                            className={cn(
                              "h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor]",
                              project.readyServiceCount === project.totalServiceCount
                                ? "bg-emerald-500"
                                : project.readyServiceCount > 0
                                  ? "bg-amber-500"
                                  : "bg-red-500",
                            )}
                          />
                          <span className="text-sm">{project.readyServiceCount}</span>
                          <span className="text-[11px] opacity-40">
                            / {project.totalServiceCount}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex justify-end opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
