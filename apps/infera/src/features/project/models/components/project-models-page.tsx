import { Funnel, Plus, RefreshCcw } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { ContentLayout } from "@/components/content-layout"
import { buildProjectPath } from "@/components/workspace/workspace-context"
import { EmptyState, ErrorState, IdBadge, TagChips } from "@/features/shared/components"
import { BaseLink } from "@/packages/platform-router"
import { Button } from "@/packages/ui/button"
import { Input } from "@/packages/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/packages/ui/tabs"
import { useProjectModelActions, useProjectModelsQuery } from "../hooks"
import type { ModelFilterState, ModelTabType } from "../types/project-models"
import { UploadModelWizard } from "./upload-model-wizard"

interface ProjectModelsPageProps {
  tenantId: string
  projectId: string
}

const DEFAULT_FILTERS: ModelFilterState = {
  source: "All",
  visibility: "All",
  license: "",
  format: "All",
  artifactType: "All",
  quantization: "",
  q: "",
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }
  return "操作失败，请稍后重试。"
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }
  return date.toLocaleString("zh-CN", { hour12: false })
}

export function ProjectModelsPage({ tenantId, projectId }: ProjectModelsPageProps) {
  const [tab, setTab] = useState<ModelTabType>("available")
  const [filters, setFilters] = useState<ModelFilterState>(DEFAULT_FILTERS)
  const [uploadOpen, setUploadOpen] = useState(false)
  const query = useProjectModelsQuery(tenantId, projectId, tab, filters)
  const actions = useProjectModelActions({ tenantId, projectId })

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          void query.refetch()
        }}
        disabled={query.isFetching}
        className="cursor-pointer"
      >
        <RefreshCcw className={query.isFetching ? "size-4 animate-spin" : "size-4"} aria-hidden />
        刷新
      </Button>
      <Button type="button" onClick={() => setUploadOpen(true)} className="cursor-pointer">
        <Plus className="size-4" aria-hidden />
        上传模型
      </Button>
    </div>
  )

  const filteredSummary = useMemo(() => {
    const tags: string[] = []
    if (filters.source !== "All") tags.push(`来源：${filters.source}`)
    if (filters.visibility !== "All") tags.push(`可见性：${filters.visibility}`)
    if (filters.format !== "All") tags.push(`格式：${filters.format}`)
    if (filters.artifactType !== "All") tags.push(`artifact：${filters.artifactType}`)
    if (filters.q.trim()) tags.push(`关键词：${filters.q.trim()}`)
    return tags
  }, [filters])

  return (
    <>
      <ContentLayout
        title="模型库"
        description="浏览项目可用模型、系统模型和租户模型，支持按来源与格式快速筛选。"
        actions={headerActions}
      >
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as ModelTabType)}
          className="space-y-4"
        >
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="available" className="cursor-pointer px-4">
              Available Models
            </TabsTrigger>
            <TabsTrigger value="system" className="cursor-pointer px-4">
              System Models
            </TabsTrigger>
            <TabsTrigger value="tenant" className="cursor-pointer px-4">
              Tenant Models
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="space-y-4 border-none p-0 outline-none">
            <div className="grid gap-3 rounded-xl border border-border/50 bg-card p-4 lg:grid-cols-6">
              <div className="lg:col-span-2">
                <Input
                  placeholder="搜索 name/version_id"
                  value={filters.q}
                  onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
                />
              </div>
              <Select
                value={filters.source}
                onValueChange={(value: ModelFilterState["source"]) =>
                  setFilters((prev) => ({ ...prev, source: value }))
                }
              >
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue placeholder="来源" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All" className="cursor-pointer">
                    All
                  </SelectItem>
                  <SelectItem value="System" className="cursor-pointer">
                    System
                  </SelectItem>
                  <SelectItem value="Tenant" className="cursor-pointer">
                    Tenant
                  </SelectItem>
                  <SelectItem value="Project" className="cursor-pointer">
                    Project
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.visibility}
                onValueChange={(value: ModelFilterState["visibility"]) =>
                  setFilters((prev) => ({ ...prev, visibility: value }))
                }
              >
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue placeholder="visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All" className="cursor-pointer">
                    All
                  </SelectItem>
                  <SelectItem value="Private" className="cursor-pointer">
                    Private
                  </SelectItem>
                  <SelectItem value="TenantShared" className="cursor-pointer">
                    TenantShared
                  </SelectItem>
                  <SelectItem value="Public" className="cursor-pointer">
                    Public
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.format}
                onValueChange={(value: ModelFilterState["format"]) =>
                  setFilters((prev) => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue placeholder="format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All" className="cursor-pointer">
                    All
                  </SelectItem>
                  <SelectItem value="safetensors" className="cursor-pointer">
                    safetensors
                  </SelectItem>
                  <SelectItem value="gguf" className="cursor-pointer">
                    gguf
                  </SelectItem>
                  <SelectItem value="bin" className="cursor-pointer">
                    bin
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.artifactType}
                onValueChange={(value: ModelFilterState["artifactType"]) =>
                  setFilters((prev) => ({ ...prev, artifactType: value }))
                }
              >
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue placeholder="artifact_type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All" className="cursor-pointer">
                    All
                  </SelectItem>
                  <SelectItem value="Full" className="cursor-pointer">
                    Full
                  </SelectItem>
                  <SelectItem value="Adapter" className="cursor-pointer">
                    Adapter
                  </SelectItem>
                  <SelectItem value="Merged" className="cursor-pointer">
                    Merged
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="cursor-pointer"
              >
                <Funnel className="size-4" aria-hidden />
                重置
              </Button>
            </div>

            {filteredSummary.length > 0 ? (
              <div className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                已启用筛选：{filteredSummary.join(" · ")}
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
              <div className="rounded-lg border border-border/50 bg-card p-6 text-sm text-muted-foreground">
                模型数据加载中...
              </div>
            ) : query.data && query.data.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-border/50 bg-card">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>来源</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Latest Version</TableHead>
                      <TableHead>参数/上下文</TableHead>
                      <TableHead>Used by</TableHead>
                      <TableHead>更新时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {query.data.map((item) => (
                      <TableRow key={item.modelId} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <p className="font-medium">{item.name}</p>
                        </TableCell>
                        <TableCell>{item.source}</TableCell>
                        <TableCell>{item.visibility}</TableCell>
                        <TableCell>
                          <TagChips
                            tags={item.tags.map((tag) => ({
                              name: tag.tagName,
                              versionId: tag.versionId,
                              to: buildProjectPath(tenantId, projectId, `/models/${item.modelId}`),
                            }))}
                          />
                        </TableCell>
                        <TableCell>
                          <IdBadge id={item.latestVersionId} />
                        </TableCell>
                        <TableCell>{item.parameterContextSummary}</TableCell>
                        <TableCell>{item.usedByServices}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDateTime(item.updatedAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button asChild variant="outline" size="sm" className="cursor-pointer">
                              <BaseLink
                                to={buildProjectPath(
                                  tenantId,
                                  projectId,
                                  `/models/${item.modelId}`,
                                )}
                              >
                                详情
                              </BaseLink>
                            </Button>
                            <Button variant="ghost" size="sm" className="cursor-pointer">
                              部署
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <EmptyState
                title="暂无可用模型"
                description="你可以先上传私有模型，或切换到系统模型浏览内置资产。"
                primaryAction={{
                  label: "上传模型",
                  onClick: () => setUploadOpen(true),
                }}
              />
            )}
          </TabsContent>
        </Tabs>
      </ContentLayout>

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
