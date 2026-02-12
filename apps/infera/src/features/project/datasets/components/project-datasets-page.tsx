import { Plus, RefreshCcw } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { buildProjectPath } from "@/components/workspace/workspace-context"
import { EmptyState, ErrorState, IdBadge } from "@/features/shared/components"
import { ContentLayout } from "@/packages/layout-core"
import { BaseLink } from "@/packages/platform-router"
import { Button } from "@/packages/ui/button"
import { Checkbox } from "@/packages/ui/checkbox"
import { Input } from "@/packages/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import { useProjectDatasetActions, useProjectDatasetsQuery } from "../hooks"
import type { DatasetFilterState } from "../types/project-datasets"
import { UploadDatasetWizard } from "./upload-dataset-wizard"

interface ProjectDatasetsPageProps {
  tenantId: string
  projectId: string
}

const DEFAULT_FILTERS: DatasetFilterState = {
  q: "",
  onlyUsed: false,
  minRows: null,
  maxRows: null,
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }
  return date.toLocaleString("zh-CN", { hour12: false })
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }
  return "操作失败，请稍后重试。"
}

export function ProjectDatasetsPage({ tenantId, projectId }: ProjectDatasetsPageProps) {
  const [filters, setFilters] = useState<DatasetFilterState>(DEFAULT_FILTERS)
  const [uploadOpen, setUploadOpen] = useState(false)
  const query = useProjectDatasetsQuery(tenantId, projectId, filters)
  const actions = useProjectDatasetActions({ tenantId, projectId })

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
        上传数据集版本
      </Button>
    </div>
  )

  return (
    <>
      <ContentLayout
        title="数据集"
        description="管理训练/评估数据集版本，支持查看 schema、token 统计和使用关系。"
        actions={headerActions}
      >
        <div className="grid gap-3 rounded-xl border border-border/50 bg-card p-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Input
              placeholder="搜索数据集名 / dataset_version_id"
              value={filters.q}
              onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
            />
          </div>
          <Input
            type="number"
            placeholder="最小 rows"
            value={filters.minRows ?? ""}
            onChange={(event) => {
              setFilters((prev) => ({
                ...prev,
                minRows: event.target.value ? Number(event.target.value) : null,
              }))
            }}
          />
          <Input
            type="number"
            placeholder="最大 rows"
            value={filters.maxRows ?? ""}
            onChange={(event) => {
              setFilters((prev) => ({
                ...prev,
                maxRows: event.target.value ? Number(event.target.value) : null,
              }))
            }}
          />
          <div className="flex items-center gap-2 rounded-md border border-border/50 px-3 py-2">
            <Checkbox
              checked={filters.onlyUsed}
              onCheckedChange={(value) =>
                setFilters((prev) => ({ ...prev, onlyUsed: value === true }))
              }
            />
            <span className="text-sm text-muted-foreground">仅显示被使用</span>
          </div>
        </div>

        {query.isError ? (
          <ErrorState
            title="数据集列表加载失败"
            message="无法获取数据集信息，请稍后重试。"
            error={query.error}
            onRetry={() => {
              void query.refetch()
            }}
          />
        ) : query.isPending ? (
          <div className="rounded-lg border border-border/50 bg-card p-6 text-sm text-muted-foreground">
            数据集加载中...
          </div>
        ) : query.data && query.data.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-border/50 bg-card">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>Latest Version</TableHead>
                  <TableHead>rows</TableHead>
                  <TableHead>token_stats</TableHead>
                  <TableHead>schema</TableHead>
                  <TableHead>used_by</TableHead>
                  <TableHead>更新时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.map((item) => (
                  <TableRow key={item.datasetId} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <p className="font-medium">{item.name}</p>
                    </TableCell>
                    <TableCell>
                      <IdBadge id={item.latestDatasetVersionId} />
                    </TableCell>
                    <TableCell>{item.rows}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.tokenStats.promptTokens} / {item.tokenStats.totalTokens}
                    </TableCell>
                    <TableCell>{item.schemaFieldCount} fields</TableCell>
                    <TableCell>{item.usedBy}</TableCell>
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
                              `/datasets/${item.datasetId}`,
                            )}
                          >
                            详情
                          </BaseLink>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setUploadOpen(true)}
                          className="cursor-pointer"
                        >
                          上传新版本
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
            title="暂无数据集"
            description="上传训练/评估数据集以开始微调或评估。"
            primaryAction={{
              label: "上传数据集",
              onClick: () => setUploadOpen(true),
            }}
          />
        )}
      </ContentLayout>

      <UploadDatasetWizard
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        tenantId={tenantId}
        projectId={projectId}
        existingDatasets={query.data ?? []}
        submitting={actions.uploadDatasetMutation.isPending}
        onSubmit={async (input) => {
          try {
            await actions.uploadDatasetMutation.mutateAsync(input)
          } catch (error) {
            toast.error(toErrorMessage(error))
          }
        }}
      />
    </>
  )
}
