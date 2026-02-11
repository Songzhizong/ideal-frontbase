import { AlertTriangle, Copy, RefreshCcw, RotateCcw, Square } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { ContentLayout } from "@/components/content-layout"
import { buildProjectPath } from "@/components/workspace/workspace-context"
import {
  EmptyState,
  ErrorState,
  IdBadge,
  LogViewer,
  StatusBadge,
} from "@/features/shared/components"
import { BaseLink, useBaseNavigate } from "@/packages/platform-router"
import { Button } from "@/packages/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/packages/ui/tabs"
import { useProjectFineTuningActions, useProjectFineTuningJobDetailQuery } from "../../hooks"
import type { FineTuningLogItem } from "../../types"
import { formatDateTime, toErrorMessage } from "../fine-tuning-formatters"
import { JobMetricsTab } from "./job-metrics-tab"

interface FineTuningJobDetailPageProps {
  tenantId: string
  projectId: string
  jobId: string
}

export function FineTuningJobDetailPage({
  tenantId,
  projectId,
  jobId,
}: FineTuningJobDetailPageProps) {
  const navigate = useBaseNavigate()
  const query = useProjectFineTuningJobDetailQuery(tenantId, projectId, jobId)
  const actions = useProjectFineTuningActions({ tenantId, projectId, jobId })
  const [activeTab, setActiveTab] = useState("overview")

  const job = query.data

  const streamSource = useMemo(() => {
    if (!job || job.status !== "Running") {
      return undefined
    }

    return {
      connect: (onMessage: (entry: FineTuningLogItem) => void) => {
        const timer = window.setInterval(() => {
          onMessage({
            id: `stream-${Math.random().toString(36).slice(2, 8)}`,
            timestamp: new Date().toISOString(),
            level: "info",
            message: `step=${Math.floor(Math.random() * 3000)} loss=${(Math.random() * 0.9 + 0.2).toFixed(4)} checkpoint syncing...`,
            instance: "ft-worker-stream",
            revision: "rev-ft-live",
          })
        }, 3200)
        return () => window.clearInterval(timer)
      },
    }
  }, [job])

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          void query.refetch()
        }}
        disabled={query.isFetching}
        className="cursor-pointer"
      >
        <RefreshCcw className={query.isFetching ? "size-4 animate-spin" : "size-4"} />
        刷新
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={() => {
          void actions.cloneJobMutation
            .mutateAsync({ tenantId, projectId, jobId })
            .catch((error: unknown) => toast.error(toErrorMessage(error)))
        }}
        className="cursor-pointer"
      >
        <Copy className="size-4" />
        克隆
      </Button>

      <Button
        type="button"
        variant="outline"
        disabled={!job || (job.status !== "Failed" && job.status !== "Canceled")}
        onClick={() => {
          void actions.retryJobMutation
            .mutateAsync({ tenantId, projectId, jobId })
            .catch((error: unknown) => toast.error(toErrorMessage(error)))
        }}
        className="cursor-pointer"
      >
        <RotateCcw className="size-4" />
        重试
      </Button>

      <Button
        type="button"
        variant="destructive"
        disabled={!job || (job.status !== "Queued" && job.status !== "Running")}
        onClick={() => {
          void actions.cancelJobMutation
            .mutateAsync({ tenantId, projectId, jobId })
            .catch((error: unknown) => toast.error(toErrorMessage(error)))
        }}
        className="cursor-pointer"
      >
        <Square className="size-4" />
        取消
      </Button>

      {job?.status === "Succeeded" ? (
        <Button asChild className="cursor-pointer">
          <BaseLink to={buildProjectPath(tenantId, projectId, "/models")}>查看产出模型</BaseLink>
        </Button>
      ) : null}
    </div>
  )

  return (
    <ContentLayout
      title={job ? `${job.jobName}` : "微调任务详情"}
      description={
        job
          ? `job_id: ${job.jobId} · base_model=${job.baseModelVersionId} · dataset=${job.datasetVersionId}`
          : "查看微调任务配置、训练指标、实时日志和产物信息。"
      }
      actions={headerActions}
    >
      {query.isPending ? (
        <div className="rounded-lg border border-border/50 bg-card p-6 text-sm text-muted-foreground">
          任务详情加载中...
        </div>
      ) : null}

      {query.isError ? (
        <ErrorState
          title="任务详情加载失败"
          message="请稍后重试或返回任务列表确认任务状态。"
          error={query.error}
          onRetry={() => {
            void query.refetch()
          }}
        />
      ) : null}

      {!query.isPending && !query.isError && !job ? (
        <EmptyState
          title="任务不存在"
          description="该微调任务可能已被清理或 ID 无效。"
          primaryAction={{
            label: "返回列表",
            onClick: () => {
              void navigate({ to: buildProjectPath(tenantId, projectId, "/fine-tuning") })
            },
          }}
        />
      ) : null}

      {!query.isPending && !query.isError && job ? (
        <div className="space-y-4">
          <div className="grid gap-3 rounded-lg border border-border/50 bg-card p-4 lg:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">状态</p>
              <StatusBadge status={job.status} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">进度</p>
              <p className="text-lg font-semibold tabular-nums">{job.progressPercent}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">创建人</p>
              <p className="text-sm">{job.createdBy}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">创建时间</p>
              <p className="text-sm">{formatDateTime(job.createdAt)}</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="overview" className="cursor-pointer px-4">
                Overview
              </TabsTrigger>
              <TabsTrigger value="metrics" className="cursor-pointer px-4">
                Metrics
              </TabsTrigger>
              <TabsTrigger value="logs" className="cursor-pointer px-4">
                Logs
              </TabsTrigger>
              <TabsTrigger value="artifacts" className="cursor-pointer px-4">
                Artifacts
              </TabsTrigger>
              <TabsTrigger value="audit" className="cursor-pointer px-4">
                Audit
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 border-none p-0 outline-none">
              <div className="grid gap-4 rounded-lg border border-border/50 bg-card p-4 lg:grid-cols-2">
                <div className="space-y-2 text-sm">
                  <p className="font-medium">训练配置</p>
                  <p>
                    base_model_version_id：
                    <IdBadge id={job.baseModelVersionId} />
                  </p>
                  <p>
                    dataset_version_id：
                    <IdBadge id={job.datasetVersionId} />
                  </p>
                  <p>训练方式：{job.method}</p>
                  <p>资源规格：{job.resourceSpec}</p>
                  <p>
                    epochs={job.hyperParameters.epochs} / batch={job.hyperParameters.batchSize} /
                    lr=
                    {job.hyperParameters.learningRate}
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">状态时间线</p>
                  {job.timeline.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-md border border-border/50 bg-muted/20 p-2"
                    >
                      <div className="flex items-center justify-between">
                        <StatusBadge status={item.status} />
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(item.at)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {job.failureReason ? (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm">
                  <div className="mb-2 flex items-center gap-2 font-medium text-red-500">
                    <AlertTriangle className="size-4" />
                    失败原因分类：{job.failureReason.category}
                  </div>
                  <p className="text-red-500">{job.failureReason.message}</p>
                  <p className="mt-1 text-xs text-red-500/90">
                    建议：{job.failureReason.suggestion}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("logs")}
                    className="mt-3 cursor-pointer"
                  >
                    查看日志定位
                  </Button>
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="metrics" className="border-none p-0 outline-none">
              <JobMetricsTab metrics={job.metrics} />
            </TabsContent>

            <TabsContent value="logs" className="border-none p-0 outline-none">
              <LogViewer
                logs={job.logs}
                {...(streamSource ? { streamSource } : {})}
                emptyText="暂无日志输出"
              />
            </TabsContent>

            <TabsContent value="artifacts" className="space-y-4 border-none p-0 outline-none">
              {job.artifacts.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-border/50 bg-card">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>artifact_type</TableHead>
                        <TableHead>output model_version_id</TableHead>
                        <TableHead>storage uri</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {job.artifacts.map((artifact) => (
                        <TableRow
                          key={artifact.artifactId}
                          className="transition-colors hover:bg-muted/50"
                        >
                          <TableCell>{artifact.artifactType}</TableCell>
                          <TableCell>
                            <IdBadge id={artifact.outputModelVersionId} />
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {artifact.storageUri}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={artifact.ready ? "Ready" : "Pending"} />
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="cursor-pointer"
                              >
                                <BaseLink
                                  to={buildProjectPath(
                                    tenantId,
                                    projectId,
                                    `/models?promoteVersionId=${encodeURIComponent(artifact.outputModelVersionId)}&promoteTag=prod`,
                                  )}
                                >
                                  注册 Tag
                                </BaseLink>
                              </Button>
                              <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="cursor-pointer"
                              >
                                <BaseLink to={buildProjectPath(tenantId, projectId, "/services")}>
                                  部署为服务
                                </BaseLink>
                              </Button>
                              <Button asChild size="sm" className="cursor-pointer">
                                <BaseLink to={buildProjectPath(tenantId, projectId, "/evaluation")}>
                                  发起评估
                                </BaseLink>
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
                  title="暂无训练产物"
                  description="任务成功后会在此展示产物并支持注册 Tag、部署服务和发起评估。"
                />
              )}
            </TabsContent>

            <TabsContent value="audit" className="border-none p-0 outline-none">
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
                    {job.audits.map((item) => (
                      <TableRow key={item.auditId} className="transition-colors hover:bg-muted/50">
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
    </ContentLayout>
  )
}
