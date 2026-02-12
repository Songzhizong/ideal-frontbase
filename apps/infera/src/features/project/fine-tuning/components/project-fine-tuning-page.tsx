import { Funnel, Plus, RefreshCcw } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { buildProjectPath } from "@/components/workspace/workspace-context"
import { EmptyState, ErrorState, IdBadge, StatusBadge } from "@/features/shared/components"
import { ContentLayout } from "@/packages/layout-core"
import { BaseLink } from "@/packages/platform-router"
import { Button } from "@/packages/ui/button"
import { Input } from "@/packages/ui/input"
import { Progress } from "@/packages/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { Skeleton } from "@/packages/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import {
  useFineTuningWizardOptionsQuery,
  useProjectFineTuningActions,
  useProjectFineTuningQuery,
} from "../hooks"
import type { FineTuningFilterState, FineTuningStatus } from "../types"
import { CreateFineTuningJobWizard } from "./create-job-wizard"
import { formatDateTime, formatProgress, toErrorMessage } from "./fine-tuning-formatters"

interface ProjectFineTuningPageProps {
  tenantId: string
  projectId: string
}

const DEFAULT_FILTERS: FineTuningFilterState = {
  q: "",
  status: "All",
  method: "All",
  createdBy: "All",
  timeRange: "All",
}

const STATUS_OPTIONS: Array<{ label: string; value: FineTuningStatus | "All" }> = [
  { label: "全部状态", value: "All" },
  { label: "Queued", value: "Queued" },
  { label: "Running", value: "Running" },
  { label: "Succeeded", value: "Succeeded" },
  { label: "Failed", value: "Failed" },
  { label: "Canceled", value: "Canceled" },
]

export function ProjectFineTuningPage({ tenantId, projectId }: ProjectFineTuningPageProps) {
  const [filters, setFilters] = useState<FineTuningFilterState>(DEFAULT_FILTERS)
  const [createOpen, setCreateOpen] = useState(false)
  const listQuery = useProjectFineTuningQuery(tenantId, projectId, filters)
  const wizardOptionsQuery = useFineTuningWizardOptionsQuery(tenantId, projectId)
  const actions = useProjectFineTuningActions({ tenantId, projectId })

  const createdByOptions = useMemo(() => {
    const creators = new Set<string>()
    for (const job of listQuery.data ?? []) {
      creators.add(job.createdBy)
    }
    return Array.from(creators)
  }, [listQuery.data])

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          void listQuery.refetch()
        }}
        disabled={listQuery.isFetching}
        className="cursor-pointer"
      >
        <RefreshCcw className={listQuery.isFetching ? "size-4 animate-spin" : "size-4"} />
        刷新
      </Button>
      <Button type="button" className="cursor-pointer" onClick={() => setCreateOpen(true)}>
        <Plus className="size-4" />
        创建微调任务
      </Button>
    </div>
  )

  return (
    <>
      <ContentLayout
        title="微调任务"
        description="管理项目微调任务，追踪训练进度、日志与产物交付状态。"
        actions={headerActions}
      >
        <div className="grid gap-3 rounded-xl border border-border/50 bg-card p-4 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Input
              placeholder="搜索 job_id / base_model / dataset"
              value={filters.q}
              onChange={(event) =>
                setFilters((previous) => ({ ...previous, q: event.target.value }))
              }
            />
          </div>

          <Select
            value={filters.status}
            onValueChange={(value) =>
              setFilters((previous) => ({ ...previous, status: value as FineTuningStatus | "All" }))
            }
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.method}
            onValueChange={(value) =>
              setFilters((previous) => ({
                ...previous,
                method: value as FineTuningFilterState["method"],
              }))
            }
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue placeholder="方法" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All" className="cursor-pointer">
                全部方法
              </SelectItem>
              <SelectItem value="LoRA" className="cursor-pointer">
                LoRA
              </SelectItem>
              <SelectItem value="Full" className="cursor-pointer">
                Full
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.createdBy}
            onValueChange={(value) =>
              setFilters((previous) => ({ ...previous, createdBy: value as string | "All" }))
            }
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue placeholder="创建人" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All" className="cursor-pointer">
                全部创建人
              </SelectItem>
              {createdByOptions.map((createdBy) => (
                <SelectItem key={createdBy} value={createdBy} className="cursor-pointer">
                  {createdBy}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Select
              value={filters.timeRange}
              onValueChange={(value) =>
                setFilters((previous) => ({
                  ...previous,
                  timeRange: value as FineTuningFilterState["timeRange"],
                }))
              }
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="时间范围" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All" className="cursor-pointer">
                  全部时间
                </SelectItem>
                <SelectItem value="24h" className="cursor-pointer">
                  24h
                </SelectItem>
                <SelectItem value="7d" className="cursor-pointer">
                  7d
                </SelectItem>
                <SelectItem value="30d" className="cursor-pointer">
                  30d
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

        {listQuery.isError ? (
          <ErrorState
            title="微调任务加载失败"
            message="无法获取任务列表，请稍后重试。"
            error={listQuery.error}
            onRetry={() => {
              void listQuery.refetch()
            }}
          />
        ) : null}

        {listQuery.isPending ? (
          <div className="space-y-2 rounded-xl border border-border/50 bg-card p-4">
            {[0, 1, 2, 3].map((index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        ) : null}

        {!listQuery.isPending &&
        !listQuery.isError &&
        listQuery.data &&
        listQuery.data.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-border/50 bg-card">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>job_id</TableHead>
                  <TableHead>任务名</TableHead>
                  <TableHead>base_model</TableHead>
                  <TableHead>dataset</TableHead>
                  <TableHead>方法</TableHead>
                  <TableHead>资源规格</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>进度</TableHead>
                  <TableHead>预估成本</TableHead>
                  <TableHead>创建信息</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listQuery.data.map((job) => (
                  <TableRow key={job.jobId} className="transition-colors hover:bg-muted/50">
                    <TableCell>
                      <IdBadge id={job.jobId} />
                    </TableCell>
                    <TableCell className="font-medium">{job.jobName}</TableCell>
                    <TableCell>
                      <IdBadge id={job.baseModelVersionId} />
                    </TableCell>
                    <TableCell>
                      <IdBadge id={job.datasetVersionId} />
                    </TableCell>
                    <TableCell>{job.method}</TableCell>
                    <TableCell>{job.resourceSpec}</TableCell>
                    <TableCell>
                      <StatusBadge status={job.status} />
                    </TableCell>
                    <TableCell>
                      <div className="w-36 space-y-1">
                        <Progress value={job.progressPercent} />
                        <p className="text-xs text-muted-foreground">
                          {formatProgress(job.progressPercent)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{job.estimatedCost}</TableCell>
                    <TableCell>
                      <p className="text-xs text-muted-foreground">{job.createdBy}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(job.createdAt)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline" className="cursor-pointer">
                          <BaseLink
                            to={buildProjectPath(tenantId, projectId, `/fine-tuning/${job.jobId}`)}
                          >
                            详情
                          </BaseLink>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={job.status !== "Queued" && job.status !== "Running"}
                          onClick={() => {
                            void actions.cancelJobMutation
                              .mutateAsync({ tenantId, projectId, jobId: job.jobId })
                              .catch((error: unknown) => {
                                toast.error(toErrorMessage(error))
                              })
                          }}
                          className="cursor-pointer"
                        >
                          取消
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}

        {!listQuery.isPending && !listQuery.isError && listQuery.data?.length === 0 ? (
          <EmptyState
            title="暂无微调任务"
            description="创建一个微调任务开始训练流程，并在任务详情中追踪指标与日志。"
            primaryAction={{
              label: "创建任务",
              onClick: () => setCreateOpen(true),
            }}
          />
        ) : null}
      </ContentLayout>

      <CreateFineTuningJobWizard
        open={createOpen}
        onOpenChange={setCreateOpen}
        tenantId={tenantId}
        projectId={projectId}
        options={wizardOptionsQuery.data}
        submitting={actions.createJobMutation.isPending}
        onSubmit={async (input) => {
          try {
            await actions.createJobMutation.mutateAsync(input)
          } catch (error) {
            toast.error(toErrorMessage(error))
          }
        }}
      />
    </>
  )
}
