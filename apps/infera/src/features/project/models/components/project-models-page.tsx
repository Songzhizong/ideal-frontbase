import { Plus, RefreshCcw, Search } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { ContentLayout } from "@/components/content-layout"
import { EmptyState, ErrorState } from "@/features/shared/components"
import { Button } from "@/packages/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/ui/card"
import { Input } from "@/packages/ui/input"
import { Kbd, KbdGroup } from "@/packages/ui/kbd"
import { ToggleGroup, ToggleGroupItem } from "@/packages/ui/toggle-group"
import { cn } from "@/packages/ui-utils"
import { useProjectModelActions, useProjectModelsQuery } from "../hooks"
import type { ModelFilterState, ProjectModelItem } from "../types/project-models"
import { ProjectModelsGridView, ProjectModelsListView } from "./project-models-collection-view"
import { ProjectModelsLoadingState } from "./project-models-loading-state"
import {
  DEFAULT_FILTERS,
  type HealthFilter,
  type ModelTypeFilter,
  toErrorMessage,
  toModelViewItems,
  type ViewMode,
} from "./project-models-page.helpers"
import { ProjectModelsPlaygroundSheet } from "./project-models-playground-sheet"
import { ViewModeToggle } from "./project-models-view-mode-toggle"
import { UploadModelWizard } from "./upload-model-wizard"

interface ProjectModelsPageProps {
  tenantId: string
  projectId: string
}

interface MetricsItem {
  title: string
  value: string
  hint: string
}

export function ProjectModelsPage({ tenantId, projectId }: ProjectModelsPageProps) {
  const [filters, setFilters] = useState<ModelFilterState>(DEFAULT_FILTERS)
  const [typeFilter, setTypeFilter] = useState<ModelTypeFilter>("All")
  const [statusFilter, setStatusFilter] = useState<HealthFilter>("All")
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [playgroundModel, setPlaygroundModel] = useState<ProjectModelItem | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const query = useProjectModelsQuery(tenantId, projectId, "available", filters)
  const actions = useProjectModelActions({ tenantId, projectId })

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener("keydown", handleKeydown)
    return () => {
      window.removeEventListener("keydown", handleKeydown)
    }
  }, [])

  const modelItems = useMemo(() => toModelViewItems(query.data ?? []), [query.data])

  const visibleItems = useMemo(() => {
    return modelItems.filter((item) => {
      if (typeFilter !== "All" && item.modelType !== typeFilter) {
        return false
      }
      if (statusFilter !== "All" && item.healthStatus !== statusFilter) {
        return false
      }
      return true
    })
  }, [modelItems, statusFilter, typeFilter])

  const metrics = useMemo<MetricsItem[]>(() => {
    const total = visibleItems.length
    const online = visibleItems.filter((item) => item.healthStatus === "Active").length
    const calls = visibleItems.reduce((sum, item) => {
      const base =
        item.modelType === "LLM" ? 160_000 : item.modelType === "Embedding" ? 90_000 : 70_000
      return sum + base + item.usedByServices * 26_000
    }, 0)
    const averageLatency =
      visibleItems.length > 0
        ? Math.round(
            visibleItems.reduce((sum, item) => sum + item.estimatedLatencyMs, 0) /
              visibleItems.length,
          )
        : 0

    return [
      {
        title: "总模型数",
        value: String(total),
        hint: "当前筛选范围内可管理模型",
      },
      {
        title: "在线部署数",
        value: String(online),
        hint: "处于运行中的模型实例",
      },
      {
        title: "本月调用量",
        value: calls.toLocaleString("zh-CN"),
        hint: "基于已部署服务估算",
      },
      {
        title: "平均响应延迟",
        value: `${averageLatency}ms`,
        hint: "综合类型与负载预估",
      },
    ]
  }, [visibleItems])

  const activeFilters = useMemo(() => {
    const summary: string[] = []
    if (filters.source !== "All") summary.push(`来源：${filters.source}`)
    if (typeFilter !== "All") summary.push(`类型：${typeFilter}`)
    if (statusFilter !== "All") summary.push(`状态：${statusFilter}`)
    if (filters.q.trim()) summary.push(`关键词：${filters.q.trim()}`)
    return summary
  }, [filters.q, filters.source, statusFilter, typeFilter])

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setTypeFilter("All")
    setStatusFilter("All")
  }

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          void query.refetch()
        }}
        disabled={query.isFetching}
        className="cursor-pointer border-border/60 bg-card shadow-xs"
      >
        <RefreshCcw className={cn("size-4", query.isFetching ? "animate-spin" : "")} aria-hidden />
        刷新
      </Button>
      <Button
        type="button"
        onClick={() => setUploadOpen(true)}
        className="cursor-pointer shadow-xs transition-shadow hover:shadow-md"
      >
        <Plus className="size-4" aria-hidden />
        上传模型
      </Button>
    </div>
  )

  return (
    <>
      <ContentLayout
        title="模型库"
        description="统一管理项目、系统与租户模型资产，支持状态洞察、快速筛选与即时测试。"
        actions={headerActions}
      >
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <Card key={metric.title} className="border-border/60 shadow-xs">
                <CardHeader className="pb-2">
                  <CardDescription>{metric.title}</CardDescription>
                  <CardTitle className="text-2xl tabular-nums">{metric.value}</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">{metric.hint}</CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border/60 shadow-xs">
            <CardContent className="space-y-4 p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="搜索模型名或版本号"
                  value={filters.q}
                  onChange={(event) => {
                    setFilters((prev) => ({ ...prev, q: event.target.value }))
                  }}
                  className="h-10 pr-20 pl-9"
                />
                <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                  <KbdGroup>
                    <Kbd>⌘</Kbd>
                    <Kbd>K</Kbd>
                  </KbdGroup>
                </div>
              </div>

              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-wrap gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">来源</p>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      size="sm"
                      value={filters.source}
                      onValueChange={(value) => {
                        if (value.length > 0) {
                          setFilters((prev) => ({
                            ...prev,
                            source: value as ModelFilterState["source"],
                          }))
                        }
                      }}
                    >
                      <ToggleGroupItem value="All" className="cursor-pointer">
                        All
                      </ToggleGroupItem>
                      <ToggleGroupItem value="Project" className="cursor-pointer">
                        Project
                      </ToggleGroupItem>
                      <ToggleGroupItem value="System" className="cursor-pointer">
                        System
                      </ToggleGroupItem>
                      <ToggleGroupItem value="Tenant" className="cursor-pointer">
                        Tenant
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">类型</p>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      size="sm"
                      value={typeFilter}
                      onValueChange={(value) => {
                        if (value.length > 0) {
                          setTypeFilter(value as ModelTypeFilter)
                        }
                      }}
                    >
                      <ToggleGroupItem value="All" className="cursor-pointer">
                        All
                      </ToggleGroupItem>
                      <ToggleGroupItem value="LLM" className="cursor-pointer">
                        LLM
                      </ToggleGroupItem>
                      <ToggleGroupItem value="Embedding" className="cursor-pointer">
                        Embedding
                      </ToggleGroupItem>
                      <ToggleGroupItem value="Rerank" className="cursor-pointer">
                        Rerank
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">状态</p>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      size="sm"
                      value={statusFilter}
                      onValueChange={(value) => {
                        if (value.length > 0) {
                          setStatusFilter(value as HealthFilter)
                        }
                      }}
                    >
                      <ToggleGroupItem value="All" className="cursor-pointer">
                        All
                      </ToggleGroupItem>
                      <ToggleGroupItem value="Active" className="cursor-pointer">
                        Active
                      </ToggleGroupItem>
                      <ToggleGroupItem value="Offline" className="cursor-pointer">
                        Offline
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ViewModeToggle value={viewMode} onValueChange={setViewMode} />
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={resetFilters}
                  >
                    重置
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {activeFilters.length > 0 ? (
            <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              已启用筛选：{activeFilters.join(" · ")}
            </div>
          ) : null}

          {query.isError ? (
            <ErrorState
              title="模型列表加载失败"
              message="无法获取模型数据，请稍后重试。"
              error={query.error}
              onRetry={() => {
                void query.refetch()
              }}
            />
          ) : query.isPending ? (
            <ProjectModelsLoadingState viewMode={viewMode} />
          ) : visibleItems.length > 0 ? (
            viewMode === "list" ? (
              <ProjectModelsListView
                tenantId={tenantId}
                projectId={projectId}
                items={visibleItems}
                onOpenPlayground={setPlaygroundModel}
                onCloneModel={() => toast.success("已创建克隆草稿")}
                onDisableModel={() => toast.warning("模型已标记停用")}
                onExportConfig={() => toast.success("配置导出任务已提交")}
              />
            ) : (
              <ProjectModelsGridView
                tenantId={tenantId}
                projectId={projectId}
                items={visibleItems}
                onOpenPlayground={setPlaygroundModel}
                onCloneModel={() => toast.success("已创建克隆草稿")}
                onDisableModel={() => toast.warning("模型已标记停用")}
                onExportConfig={() => toast.success("配置导出任务已提交")}
              />
            )
          ) : (
            <EmptyState
              title="暂无匹配模型"
              description="试试调整组合筛选条件，或上传一个新模型。"
              primaryAction={{
                label: "上传模型",
                onClick: () => setUploadOpen(true),
              }}
            />
          )}
        </div>
      </ContentLayout>

      <ProjectModelsPlaygroundSheet
        open={playgroundModel !== null}
        model={playgroundModel}
        onOpenChange={(open) => {
          if (!open) {
            setPlaygroundModel(null)
          }
        }}
      />

      <UploadModelWizard
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        tenantId={tenantId}
        projectId={projectId}
        existingModels={query.data ?? []}
        submitting={actions.uploadModelMutation.isPending}
        onSubmit={async (payload) => {
          try {
            await actions.uploadModelMutation.mutateAsync(payload)
          } catch (error) {
            toast.error(toErrorMessage(error))
          }
        }}
      />
    </>
  )
}
