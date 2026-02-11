import { Download, RefreshCcw, RotateCcw } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { ContentLayout } from "@/components/content-layout"
import { buildProjectPath } from "@/components/workspace/workspace-context"
import { EmptyState, ErrorState, IdBadge, StatusBadge } from "@/features/shared/components"
import { useBaseNavigate } from "@/packages/platform-router"
import { Badge } from "@/packages/ui/badge"
import { Button } from "@/packages/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/packages/ui/tabs"
import { useProjectEvaluationActions, useProjectEvaluationDetailQuery } from "../../hooks"
import { formatDateTime, toErrorMessage } from "../evaluation-formatters"
import { EvalGateTab } from "./eval-gate-tab"
import { EvalReportTab } from "./eval-report-tab"
import { EvalSideBySideTab } from "./eval-side-by-side-tab"

interface EvaluationDetailPageProps {
  tenantId: string
  projectId: string
  evalRunId: string
}

export function EvaluationDetailPage({
  tenantId,
  projectId,
  evalRunId,
}: EvaluationDetailPageProps) {
  const navigate = useBaseNavigate()
  const [activeTab, setActiveTab] = useState("report")
  const query = useProjectEvaluationDetailQuery(tenantId, projectId, evalRunId)
  const actions = useProjectEvaluationActions({ tenantId, projectId, evalRunId })

  const run = query.data

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
        onClick={() => toast.success("导出报告已开始（Mock）")}
        className="cursor-pointer"
      >
        <Download className="size-4" />
        导出报告
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={!run}
        onClick={() => {
          if (!run) {
            return
          }
          void actions.rerunMutation
            .mutateAsync({ tenantId, projectId, evalRunId: run.evalRunId })
            .catch((error: unknown) => toast.error(toErrorMessage(error)))
        }}
        className="cursor-pointer"
      >
        <RotateCcw className="size-4" />
        重新运行
      </Button>
    </div>
  )

  return (
    <ContentLayout
      title={run ? `评估详情 · ${run.evalRunId}` : "评估详情"}
      description={
        run ? `${run.targetLabel} · ${run.datasetLabel}` : "查看评估报告、对比样本和门禁结论。"
      }
      actions={headerActions}
    >
      {query.isPending ? (
        <div className="rounded-lg border border-border/50 bg-card p-6 text-sm text-muted-foreground">
          评估详情加载中...
        </div>
      ) : null}

      {query.isError ? (
        <ErrorState
          title="评估详情加载失败"
          message="请稍后重试或返回评估列表确认状态。"
          error={query.error}
          onRetry={() => {
            void query.refetch()
          }}
        />
      ) : null}

      {!query.isPending && !query.isError && !run ? (
        <EmptyState
          title="评估记录不存在"
          description="该评估可能已失效或 ID 不正确。"
          primaryAction={{
            label: "返回列表",
            onClick: () => {
              void navigate({ to: buildProjectPath(tenantId, projectId, "/evaluation") })
            },
          }}
        />
      ) : null}

      {!query.isPending && !query.isError && run ? (
        <div className="space-y-4">
          <div className="grid gap-3 rounded-lg border border-border/50 bg-card p-4 lg:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">状态</p>
              <StatusBadge status={run.status} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">门禁结果</p>
              <Badge
                variant="outline"
                className={
                  run.result === "Pass"
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                    : run.result === "Fail"
                      ? "border-red-500/20 bg-red-500/10 text-red-500"
                      : "border-border/50 bg-muted text-muted-foreground"
                }
              >
                {run.result}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">评估类型</p>
              <p className="text-sm">{run.evalType}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">创建时间</p>
              <p className="text-sm">{formatDateTime(run.createdAt)}</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="report" className="cursor-pointer px-4">
                Report
              </TabsTrigger>
              <TabsTrigger value="side-by-side" className="cursor-pointer px-4">
                Side-by-Side
              </TabsTrigger>
              <TabsTrigger value="gate" className="cursor-pointer px-4">
                Gate
              </TabsTrigger>
              <TabsTrigger value="audit" className="cursor-pointer px-4">
                Audit
              </TabsTrigger>
            </TabsList>

            <TabsContent value="report" className="border-none p-0 outline-none">
              <EvalReportTab run={run} />
            </TabsContent>

            <TabsContent value="side-by-side" className="border-none p-0 outline-none">
              <EvalSideBySideTab
                run={run}
                saving={actions.updateReviewMutation.isPending}
                onSaveReview={async (payload) => {
                  try {
                    await actions.updateReviewMutation.mutateAsync({
                      tenantId,
                      projectId,
                      evalRunId,
                      ...payload,
                    })
                  } catch (error) {
                    toast.error(toErrorMessage(error))
                  }
                }}
              />
            </TabsContent>

            <TabsContent value="gate" className="border-none p-0 outline-none">
              <EvalGateTab
                run={run}
                promoting={actions.promoteMutation.isPending}
                onPromote={async () => {
                  try {
                    await actions.promoteMutation.mutateAsync({ tenantId, projectId, evalRunId })
                    void navigate({
                      to: buildProjectPath(
                        tenantId,
                        projectId,
                        `/models?promoteVersionId=${encodeURIComponent(run.modelVersionIdA)}&promoteTag=prod&fromEval=${encodeURIComponent(run.evalRunId)}`,
                      ),
                    })
                  } catch (error) {
                    toast.error(toErrorMessage(error))
                  }
                }}
              />
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
                    {run.audits.map((item) => (
                      <TableRow key={item.auditId} className="transition-colors hover:bg-muted/50">
                        <TableCell>
                          <IdBadge id={item.auditId} />
                        </TableCell>
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
