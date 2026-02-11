import { Trash2, Upload } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { ContentLayout } from "@/components/content-layout"
import { buildProjectPath } from "@/components/workspace/workspace-context"
import { DangerConfirmDialog, EmptyState, ErrorState, IdBadge } from "@/features/shared/components"
import { useBaseNavigate } from "@/packages/platform-router"
import { Button } from "@/packages/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/packages/ui/tabs"
import { isDatasetDependencyConflict } from "../api"
import { useProjectDatasetActions, useProjectDatasetDetailQuery } from "../hooks"
import type { DatasetDependencyConflict, DatasetVersionItem } from "../types/project-datasets"
import { DatasetDependencyConflictDialog } from "./dataset-dependency-conflict-dialog"
import { DatasetVersionDetailDrawer } from "./dataset-version-detail-drawer"
import { UploadDatasetWizard } from "./upload-dataset-wizard"

interface ProjectDatasetDetailPageProps {
  tenantId: string
  projectId: string
  datasetId: string
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

export function ProjectDatasetDetailPage({
  tenantId,
  projectId,
  datasetId,
}: ProjectDatasetDetailPageProps) {
  const navigate = useBaseNavigate()
  const query = useProjectDatasetDetailQuery(tenantId, projectId, datasetId)
  const actions = useProjectDatasetActions({ tenantId, projectId, datasetId })
  const [activeTab, setActiveTab] = useState("versions")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [versionDrawerOpen, setVersionDrawerOpen] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<DatasetVersionItem | null>(null)
  const [deleteVersionTarget, setDeleteVersionTarget] = useState<DatasetVersionItem | null>(null)
  const [deleteDatasetOpen, setDeleteDatasetOpen] = useState(false)
  const [dependencyConflict, setDependencyConflict] = useState<DatasetDependencyConflict | null>(
    null,
  )
  const [dependencyOpen, setDependencyOpen] = useState(false)

  const dataset = query.data

  const latestVersion = useMemo(() => dataset?.versions[0] ?? null, [dataset])

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={() => setUploadOpen(true)} className="cursor-pointer">
        <Upload className="size-4" aria-hidden />
        上传新版本
      </Button>
      <Button
        variant="destructive"
        onClick={() => setDeleteDatasetOpen(true)}
        className="cursor-pointer"
      >
        <Trash2 className="size-4" aria-hidden />
        删除数据集
      </Button>
    </div>
  )

  return (
    <>
      <ContentLayout
        title={dataset ? dataset.name : "数据集详情"}
        description="查看数据集版本、schema 结构、token 统计和使用记录。"
        actions={headerActions}
      >
        {query.isPending ? (
          <div className="rounded-lg border border-border/50 bg-card p-6 text-sm text-muted-foreground">
            数据集详情加载中...
          </div>
        ) : null}

        {query.isError ? (
          <ErrorState
            title="数据集详情加载失败"
            message="请稍后重试或返回列表页确认数据集状态。"
            error={query.error}
            onRetry={() => {
              void query.refetch()
            }}
          />
        ) : null}

        {!query.isPending && !query.isError && dataset ? (
          <div className="space-y-4">
            <div className="grid gap-3 rounded-lg border border-border/50 bg-card p-4 lg:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">dataset_id</p>
                <IdBadge id={dataset.datasetId} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">latest_version</p>
                <IdBadge id={dataset.latestDatasetVersionId} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">rows</p>
                <p className="text-sm tabular-nums">{dataset.rows}</p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="versions" className="cursor-pointer px-4">
                  Versions
                </TabsTrigger>
                <TabsTrigger value="preview" className="cursor-pointer px-4">
                  Preview
                </TabsTrigger>
                <TabsTrigger value="usage" className="cursor-pointer px-4">
                  Usage
                </TabsTrigger>
                <TabsTrigger value="audit" className="cursor-pointer px-4">
                  Audit
                </TabsTrigger>
              </TabsList>

              <TabsContent value="versions" className="space-y-4 border-none p-0 outline-none">
                <div className="overflow-x-auto rounded-lg border border-border/50 bg-card">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>dataset_version_id</TableHead>
                        <TableHead>sha256</TableHead>
                        <TableHead>rows</TableHead>
                        <TableHead>schema</TableHead>
                        <TableHead>token_stats</TableHead>
                        <TableHead>created_at</TableHead>
                        <TableHead>used_by</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dataset.versions.map((version) => (
                        <TableRow
                          key={version.datasetVersionId}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <TableCell>
                            <IdBadge id={version.datasetVersionId} />
                          </TableCell>
                          <TableCell>
                            <IdBadge id={version.sha256} />
                          </TableCell>
                          <TableCell>{version.rows}</TableCell>
                          <TableCell>{Object.keys(version.schema).length} fields</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {version.tokenStats.promptTokens}/{version.tokenStats.totalTokens}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDateTime(version.createdAt)}
                          </TableCell>
                          <TableCell>{version.usedByCount}</TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedVersion(version)
                                  setVersionDrawerOpen(true)
                                }}
                                className="cursor-pointer"
                              >
                                详情
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteVersionTarget(version)}
                                className="cursor-pointer text-destructive"
                              >
                                删除
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-4 border-none p-0 outline-none">
                <div className="rounded-lg border border-border/50 bg-card p-4">
                  <p className="mb-2 text-sm font-semibold">样本预览</p>
                  <pre className="max-h-80 overflow-auto rounded bg-muted/20 p-3 font-mono text-xs">
                    {(dataset.previewSamples.length > 0
                      ? dataset.previewSamples
                      : ["暂无样本数据"]
                    ).join("\n")}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="usage" className="space-y-4 border-none p-0 outline-none">
                <div className="overflow-x-auto rounded-lg border border-border/50 bg-card">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>usage_type</TableHead>
                        <TableHead>target_name</TableHead>
                        <TableHead>created_at</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {latestVersion?.usage.map((item) => (
                        <TableRow key={`${item.usageType}-${item.targetName}`}>
                          <TableCell>{item.usageType}</TableCell>
                          <TableCell>{item.targetName}</TableCell>
                          <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="audit" className="space-y-4 border-none p-0 outline-none">
                <div className="overflow-x-auto rounded-lg border border-border/50 bg-card">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>audit_id</TableHead>
                        <TableHead>action</TableHead>
                        <TableHead>actor</TableHead>
                        <TableHead>happened_at</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dataset.audits.map((item) => (
                        <TableRow key={item.auditId}>
                          <TableCell className="font-mono text-xs">{item.auditId}</TableCell>
                          <TableCell>{item.action}</TableCell>
                          <TableCell>{item.actor}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDateTime(item.happenedAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : null}

        {!query.isPending && !query.isError && !dataset ? (
          <EmptyState
            title="数据集不存在"
            description="当前数据集可能已删除，请返回数据集列表确认。"
            primaryAction={{
              label: "返回列表",
              onClick: () => {
                void navigate({ to: buildProjectPath(tenantId, projectId, "/datasets") })
              },
            }}
          />
        ) : null}
      </ContentLayout>

      <DatasetVersionDetailDrawer
        open={versionDrawerOpen}
        onOpenChange={setVersionDrawerOpen}
        version={selectedVersion}
      />

      <UploadDatasetWizard
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        tenantId={tenantId}
        projectId={projectId}
        existingDatasets={dataset ? [dataset] : []}
        submitting={actions.uploadDatasetMutation.isPending}
        onSubmit={async (input) => {
          try {
            await actions.uploadDatasetMutation.mutateAsync(input)
          } catch (error) {
            toast.error(toErrorMessage(error))
          }
        }}
      />

      <DangerConfirmDialog
        open={deleteVersionTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteVersionTarget(null)
          }
        }}
        targetName={deleteVersionTarget?.datasetVersionId ?? ""}
        title="删除数据集版本"
        description="若版本仍被训练或评估任务引用，则会阻止删除。"
        confirmLabel="确认删除版本"
        onConfirm={async () => {
          if (!deleteVersionTarget) {
            return
          }
          try {
            await actions.deleteDatasetVersionMutation.mutateAsync({
              tenantId,
              projectId,
              datasetId,
              datasetVersionId: deleteVersionTarget.datasetVersionId,
            })
            setDeleteVersionTarget(null)
          } catch (error) {
            if (isDatasetDependencyConflict(error)) {
              setDependencyConflict(error.conflict)
              setDependencyOpen(true)
              setDeleteVersionTarget(null)
              return
            }
            toast.error(toErrorMessage(error))
          }
        }}
      />

      <DangerConfirmDialog
        open={deleteDatasetOpen}
        onOpenChange={setDeleteDatasetOpen}
        targetName={dataset?.name ?? ""}
        title="删除数据集"
        description="删除后会移除全部版本，操作不可恢复。"
        confirmLabel="确认删除数据集"
        onConfirm={async () => {
          try {
            await actions.deleteDatasetMutation.mutateAsync({ tenantId, projectId, datasetId })
            void navigate({ to: buildProjectPath(tenantId, projectId, "/datasets") })
          } catch (error) {
            if (isDatasetDependencyConflict(error)) {
              setDependencyConflict(error.conflict)
              setDependencyOpen(true)
              return
            }
            toast.error(toErrorMessage(error))
          }
        }}
      />

      <DatasetDependencyConflictDialog
        open={dependencyOpen}
        onOpenChange={setDependencyOpen}
        conflict={dependencyConflict}
      />
    </>
  )
}
