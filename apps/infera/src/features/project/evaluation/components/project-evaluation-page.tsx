import { Funnel, Plus, RefreshCcw } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { buildProjectPath } from "@/components/workspace/workspace-context"
import { EmptyState, ErrorState, IdBadge, StatusBadge } from "@/features/shared/components"
import { ContentLayout } from "@/packages/layout-core"
import { BaseLink } from "@/packages/platform-router"
import { Badge } from "@/packages/ui/badge"
import { Button } from "@/packages/ui/button"
import { Input } from "@/packages/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import { useProjectEvaluationActions, useProjectEvaluationsQuery } from "../hooks"
import type {
  EvaluationFilterState,
  EvaluationResult,
  EvaluationStatus,
  EvaluationType,
} from "../types"
import { CreateEvaluationWizard } from "./create-eval-wizard"
import { formatDateTime, toErrorMessage } from "./evaluation-formatters"

interface ProjectEvaluationPageProps {
  tenantId: string
  projectId: string
}

const DEFAULT_FILTERS: EvaluationFilterState = {
  q: "",
  status: "All",
  type: "All",
  result: "All",
}

export function ProjectEvaluationPage({ tenantId, projectId }: ProjectEvaluationPageProps) {
  const [filters, setFilters] = useState<EvaluationFilterState>(DEFAULT_FILTERS)
  const [createOpen, setCreateOpen] = useState(false)
  const query = useProjectEvaluationsQuery(tenantId, projectId, filters)
  const actions = useProjectEvaluationActions({ tenantId, projectId })

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
        <RefreshCcw className={query.isFetching ? "size-4 animate-spin" : "size-4"} />
        刷新
      </Button>
      <Button type="button" className="cursor-pointer" onClick={() => setCreateOpen(true)}>
        <Plus className="size-4" />
        创建评估
      </Button>
    </div>
  )

  return (
    <>
      <ContentLayout
        title="模型评估"
        description="查看评估运行结果，支持自动评估、对比评估和回归门禁。"
        actions={headerActions}
      >
        <div className="grid gap-3 rounded-xl border border-border/50 bg-card p-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Input
              placeholder="搜索 eval_run_id / model / dataset"
              value={filters.q}
              onChange={(event) =>
                setFilters((previous) => ({ ...previous, q: event.target.value }))
              }
            />
          </div>

          <Select
            value={filters.status}
            onValueChange={(value) =>
              setFilters((previous) => ({ ...previous, status: value as EvaluationStatus | "All" }))
            }
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              {["All", "Running", "Succeeded", "Failed"].map((status) => (
                <SelectItem key={status} value={status} className="cursor-pointer">
                  {status === "All" ? "全部状态" : status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.type}
            onValueChange={(value) =>
              setFilters((previous) => ({ ...previous, type: value as EvaluationType | "All" }))
            }
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue placeholder="类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All" className="cursor-pointer">
                全部类型
              </SelectItem>
              <SelectItem value="auto" className="cursor-pointer">
                自动评估
              </SelectItem>
              <SelectItem value="comparison" className="cursor-pointer">
                对比评估
              </SelectItem>
              <SelectItem value="gate" className="cursor-pointer">
                回归门禁
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Select
              value={filters.result}
              onValueChange={(value) =>
                setFilters((previous) => ({
                  ...previous,
                  result: value as EvaluationResult | "All",
                }))
              }
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="结果" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All" className="cursor-pointer">
                  全部结果
                </SelectItem>
                <SelectItem value="Pass" className="cursor-pointer">
                  Pass
                </SelectItem>
                <SelectItem value="Fail" className="cursor-pointer">
                  Fail
                </SelectItem>
                <SelectItem value="N/A" className="cursor-pointer">
                  N/A
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="cursor-pointer"
            >
              <Funnel className="size-4" />
              重置
            </Button>
          </div>
        </div>

        {query.isError ? (
          <ErrorState
            title="评估列表加载失败"
            message="无法获取评估运行信息，请稍后重试。"
            error={query.error}
            onRetry={() => {
              void query.refetch()
            }}
          />
        ) : null}

        {query.isPending ? (
          <div className="rounded-lg border border-border/50 bg-card p-6 text-sm text-muted-foreground">
            评估数据加载中...
          </div>
        ) : null}

        {!query.isPending && !query.isError && query.data && query.data.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-border/50 bg-card">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>eval_run_id</TableHead>
                  <TableHead>评估对象</TableHead>
                  <TableHead>测试集</TableHead>
                  <TableHead>指标摘要</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>结果</TableHead>
                  <TableHead>创建信息</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.map((item) => (
                  <TableRow key={item.evalRunId} className="transition-colors hover:bg-muted/50">
                    <TableCell>
                      <IdBadge id={item.evalRunId} />
                    </TableCell>
                    <TableCell>{item.targetLabel}</TableCell>
                    <TableCell>{item.datasetLabel}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.metricsSummary}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          item.result === "Pass"
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                            : item.result === "Fail"
                              ? "border-red-500/20 bg-red-500/10 text-red-500"
                              : "border-border/50 bg-muted text-muted-foreground"
                        }
                      >
                        {item.result}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-muted-foreground">{item.createdBy}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(item.createdAt)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="sm" className="cursor-pointer">
                          <BaseLink
                            to={buildProjectPath(
                              tenantId,
                              projectId,
                              `/evaluation/${item.evalRunId}`,
                            )}
                          >
                            查看报告
                          </BaseLink>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            void actions.rerunMutation
                              .mutateAsync({ tenantId, projectId, evalRunId: item.evalRunId })
                              .catch((error: unknown) => {
                                toast.error(toErrorMessage(error))
                              })
                          }}
                          className="cursor-pointer"
                        >
                          重新运行
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}

        {!query.isPending && !query.isError && query.data?.length === 0 ? (
          <EmptyState
            title="暂无评估任务"
            description="创建评估任务后可在这里查看报告、对比结果和门禁结论。"
            primaryAction={{
              label: "创建评估",
              onClick: () => setCreateOpen(true),
            }}
          />
        ) : null}
      </ContentLayout>

      <CreateEvaluationWizard
        open={createOpen}
        onOpenChange={setCreateOpen}
        tenantId={tenantId}
        projectId={projectId}
        submitting={actions.createRunMutation.isPending}
        onSubmit={async (input) => {
          try {
            await actions.createRunMutation.mutateAsync(input)
          } catch (error) {
            toast.error(toErrorMessage(error))
          }
        }}
      />
    </>
  )
}
