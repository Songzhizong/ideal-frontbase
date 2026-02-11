import { ChevronDown, Copy, FlaskConical, MoreHorizontal, Rocket, Timer } from "lucide-react"
import { buildProjectPath } from "@/components/workspace/workspace-context"
import { BaseLink } from "@/packages/platform-router"
import { Badge } from "@/packages/ui/badge"
import { Button } from "@/packages/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/packages/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import { cn } from "@/packages/ui-utils"
import type { ProjectModelItem } from "../types/project-models"
import {
  copyText,
  formatDateTime,
  getModelTypeIcon,
  getTagClassName,
  getVersionHistory,
  type ModelViewItem,
  shortVersion,
} from "./project-models-page.helpers"

interface ProjectModelsCollectionProps {
  tenantId: string
  projectId: string
  items: ModelViewItem[]
  onOpenPlayground: (model: ProjectModelItem) => void
  onCloneModel?: (model: ProjectModelItem) => void
  onDisableModel?: (model: ProjectModelItem) => void
  onExportConfig?: (model: ProjectModelItem) => void
}

export function ProjectModelsListView({
  tenantId,
  projectId,
  items,
  onOpenPlayground,
  onCloneModel,
  onDisableModel,
  onExportConfig,
}: ProjectModelsCollectionProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/50 bg-card">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>模型名称</TableHead>
            <TableHead>标签</TableHead>
            <TableHead>最新版本</TableHead>
            <TableHead>参数 / 上下文</TableHead>
            <TableHead>健康状态</TableHead>
            <TableHead>更新时间</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const TypeIcon = getModelTypeIcon(item.modelType)
            const versionHistory = getVersionHistory(item)

            return (
              <TableRow key={item.modelId} className="transition-colors hover:bg-muted/30">
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex size-7 items-center justify-center rounded-md border border-border/60 bg-muted/20 text-muted-foreground">
                        <TypeIcon className="size-4" aria-hidden />
                      </span>
                      <p className="font-medium">{item.name}</p>
                      <Badge variant="outline" className="text-[11px]">
                        {item.modelType}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">来源：{item.source}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <Badge
                        key={`${item.modelId}-${tag.tagName}-${tag.versionId}`}
                        variant="outline"
                        className={cn("text-[11px]", getTagClassName(tag.tagName))}
                      >
                        {tag.tagName}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="inline-flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer font-mono text-xs"
                      onClick={() => {
                        void copyText(item.latestVersionId, "版本号已复制")
                      }}
                    >
                      <Copy className="size-3.5" aria-hidden />
                      {shortVersion(item.latestVersionId)}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" className="size-8 cursor-pointer">
                          <ChevronDown className="size-4" aria-hidden />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-62">
                        <DropdownMenuLabel>历史版本</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {versionHistory.map((version) => (
                          <DropdownMenuItem
                            key={`${item.modelId}-${version.versionId}`}
                            className="cursor-pointer"
                            onClick={() => {
                              void copyText(version.versionId, "历史版本号已复制")
                            }}
                          >
                            <span className="flex flex-col gap-0.5">
                              <span className="font-mono text-xs">{version.versionId}</span>
                              <span className="text-[11px] text-muted-foreground">
                                {formatDateTime(version.updatedAt)}
                              </span>
                            </span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge
                      variant="outline"
                      className="border-info/30 bg-info-subtle text-info-on-subtle"
                    >
                      {item.parameterSize}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-success/30 bg-success-subtle text-success-on-subtle"
                    >
                      {item.contextLength}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="relative flex size-2.5">
                      <span
                        className={cn(
                          "absolute inline-flex h-full w-full rounded-full opacity-70 motion-safe:animate-ping",
                          item.healthStatus === "Active" ? "bg-success" : "bg-muted-foreground",
                        )}
                      />
                      <span
                        className={cn(
                          "relative inline-flex size-2.5 rounded-full",
                          item.healthStatus === "Active" ? "bg-success" : "bg-muted-foreground",
                        )}
                      />
                    </span>
                    {item.healthStatus === "Active" ? "在线" : "离线"}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDateTime(item.updatedAt)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="outline" size="sm" className="cursor-pointer">
                      <BaseLink
                        to={buildProjectPath(tenantId, projectId, `/models/${item.modelId}`)}
                      >
                        详情
                      </BaseLink>
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="cursor-pointer">
                      <Rocket className="size-3.5" aria-hidden />
                      部署
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => onOpenPlayground(item)}
                    >
                      <FlaskConical className="size-3.5" aria-hidden />
                      测试
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="size-8 cursor-pointer"
                        >
                          <MoreHorizontal className="size-4" aria-hidden />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuLabel>更多操作</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => onCloneModel?.(item)}
                        >
                          复制模型
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => onDisableModel?.(item)}
                        >
                          停用模型
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => onExportConfig?.(item)}
                        >
                          导出配置
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

export function ProjectModelsGridView({
  tenantId,
  projectId,
  items,
  onOpenPlayground,
  onCloneModel,
  onDisableModel,
  onExportConfig,
}: ProjectModelsCollectionProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const TypeIcon = getModelTypeIcon(item.modelType)

        return (
          <Card
            key={item.modelId}
            className="border-border/60 bg-card/90 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <CardHeader className="gap-3 pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="line-clamp-1 text-base">{item.name}</CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-1.5 text-xs">
                    <TypeIcon className="size-3.5" aria-hidden />
                    {item.modelType} · {item.source}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[11px]">
                  {item.visibility}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <Badge
                    key={`${item.modelId}-card-${tag.tagName}-${tag.versionId}`}
                    variant="outline"
                    className={cn("text-[11px]", getTagClassName(tag.tagName))}
                  >
                    {tag.tagName}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex items-center gap-2 text-xs">
                <Badge
                  variant="outline"
                  className="border-info/30 bg-info-subtle text-info-on-subtle"
                >
                  {item.parameterSize}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-success/30 bg-success-subtle text-success-on-subtle"
                >
                  {item.contextLength}
                </Badge>
                <span className="ml-auto flex items-center gap-1 text-muted-foreground">
                  <Timer className="size-3.5" aria-hidden />
                  {item.estimatedLatencyMs}ms
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-border/50 bg-muted/20 px-2.5 py-2">
                  <p className="text-muted-foreground">服务引用</p>
                  <p className="mt-1 font-semibold tabular-nums">{item.usedByServices}</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-muted/20 px-2.5 py-2">
                  <p className="text-muted-foreground">更新时间</p>
                  <p className="mt-1 truncate font-medium">{formatDateTime(item.updatedAt)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer font-mono text-xs"
                  onClick={() => {
                    void copyText(item.latestVersionId, "版本号已复制")
                  }}
                >
                  <Copy className="size-3.5" aria-hidden />
                  {shortVersion(item.latestVersionId)}
                </Button>
                <div className="flex gap-1">
                  <Button asChild variant="ghost" size="sm" className="cursor-pointer">
                    <BaseLink to={buildProjectPath(tenantId, projectId, `/models/${item.modelId}`)}>
                      详情
                    </BaseLink>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => onOpenPlayground(item)}
                  >
                    <FlaskConical className="size-3.5" aria-hidden />
                    测试
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="size-8 cursor-pointer"
                      >
                        <MoreHorizontal className="size-4" aria-hidden />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuLabel>更多操作</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => onCloneModel?.(item)}
                      >
                        复制模型
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => onDisableModel?.(item)}
                      >
                        停用模型
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => onExportConfig?.(item)}
                      >
                        导出配置
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
