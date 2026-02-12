import { AlertTriangle, Plus } from "lucide-react"
import { motion } from "motion/react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { buildProjectPath } from "@/components/workspace/workspace-context"
import { getHttpErrorMessage } from "@/features/core/api"
import { EmptyState, ErrorState } from "@/features/shared/components"
import { useBaseNavigate } from "@/hooks"
import { isApiError } from "@/packages/error-core"
import { ContentLayout } from "@/packages/layout-core"
import { createColumnHelper } from "@/packages/table"
import { Alert, AlertDescription } from "@/packages/ui/alert"
import { Button } from "@/packages/ui/button"
import { useCreateTenantProject } from "../hooks/use-create-tenant-project"
import { useDeleteTenantProject } from "../hooks/use-delete-tenant-project"
import {
  resolveTenantProjectsTableMeta,
  useTenantProjectsTable,
} from "../hooks/use-tenant-projects-table"
import type { TenantProjectEnvironment, TenantProjectItem } from "../types/tenant-projects"
import { TENANT_PROJECT_COST_RANGE_OPTIONS } from "../utils/tenant-projects-formatters"
import { CreateProjectDialog } from "./create-project-dialog"
import { CreateProjectPlaceholderCard } from "./create-project-placeholder-card"
import { DeleteProjectDialog } from "./delete-project-dialog"
import { TenantProjectCard, TenantProjectCardSkeleton } from "./tenant-project-card"
import { TenantProjectsFilterPanel } from "./tenant-projects-filter-panel"
import { TenantProjectsGlobalMetrics } from "./tenant-projects-global-metrics"
import { TenantProjectsPagination } from "./tenant-projects-pagination"

interface TenantProjectsPageProps {
  tenantId: string
}

const SEARCH_DEBOUNCE_MS = 320
const helper = createColumnHelper<TenantProjectItem>()

const COST_RANGE_LABEL_MAP: ReadonlyMap<string, string> = new Map(
  TENANT_PROJECT_COST_RANGE_OPTIONS.map((option) => [option.value, option.label]),
)

function toErrorMessage(error: unknown) {
  if (isApiError(error)) {
    const detail = error.problem?.detail
    const isResourceInUse =
      typeof detail === "string" && detail.toLowerCase().includes("resource_in_use")
    if (error.status === 409 && detail && !isResourceInUse) {
      return detail
    }

    return getHttpErrorMessage(error)
  }

  if (error instanceof Error) {
    return error.message
  }

  return "操作失败，请稍后重试。"
}

export function TenantProjectsPage({ tenantId }: TenantProjectsPageProps) {
  const navigate = useBaseNavigate()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deletingProject, setDeletingProject] = useState<TenantProjectItem | null>(null)
  const [searchInput, setSearchInput] = useState("")

  const createMutation = useCreateTenantProject()
  const deleteMutation = useDeleteTenantProject()

  const columns = useMemo(() => [helper.accessor("projectName", { header: "项目" })], [])

  const dt = useTenantProjectsTable({
    tenantId,
    columns,
  })

  const tableMeta = resolveTenantProjectsTableMeta(dt.meta.data?.extraMeta)

  useEffect(() => {
    setSearchInput(dt.filters.state.q)
  }, [dt.filters.state.q])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchInput !== dt.filters.state.q) {
        dt.filters.set("q", searchInput)
      }
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
    }
  }, [searchInput, dt.filters, dt.filters.state.q])

  const projects = dt.table.getRowModel().rows.map((row) => row.original)
  const isRefreshing = dt.activity.isInitialLoading || dt.activity.isFetching
  const isFetchingOnly = dt.activity.isFetching && !dt.activity.isInitialLoading

  const totalProjects = dt.pagination.total ?? projects.length
  const pageStart = projects.length === 0 ? 0 : (dt.pagination.page - 1) * dt.pagination.size + 1
  const pageEnd = projects.length === 0 ? 0 : pageStart + projects.length - 1

  const hasActiveFilters =
    searchInput.trim().length > 0 ||
    dt.filters.state.environment !== null ||
    dt.filters.state.ownerId !== null ||
    dt.filters.state.costRange !== null

  const environmentSummary = useMemo(() => {
    const base: Record<TenantProjectEnvironment, number> = {
      Dev: 0,
      Test: 0,
      Prod: 0,
    }

    for (const project of projects) {
      base[project.environment] += 1
    }

    return base
  }, [projects])

  const activeFilterLabels = useMemo(() => {
    const labels: string[] = []

    if (dt.filters.state.environment) {
      labels.push(`环境：${dt.filters.state.environment}`)
    }

    if (dt.filters.state.ownerId) {
      const owner = tableMeta.ownerOptions.find((item) => item.userId === dt.filters.state.ownerId)
      labels.push(`Owner：${owner?.displayName ?? dt.filters.state.ownerId}`)
    }

    if (dt.filters.state.costRange) {
      labels.push(
        `成本：${COST_RANGE_LABEL_MAP.get(dt.filters.state.costRange) ?? dt.filters.state.costRange}`,
      )
    }

    return labels
  }, [
    dt.filters.state.costRange,
    dt.filters.state.environment,
    dt.filters.state.ownerId,
    tableMeta.ownerOptions,
  ])

  const headerActions = (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        onClick={() => setCreateDialogOpen(true)}
        disabled={!tableMeta.canCreateProject}
        className="cursor-pointer"
      >
        <Plus className="size-4" aria-hidden />
        创建项目
      </Button>
    </div>
  )

  return (
    <>
      <ContentLayout
        title="项目驾驶舱"
        description="以驾驶舱视图管理租户项目、成本与服务健康。适配小规模项目集（常驻 10 个以内）的高频巡检场景。"
        actions={headerActions}
        className="flex h-full flex-col"
        contentClassName="flex min-h-0 flex-1 flex-col overflow-auto p-4 scrollbar-thin md:p-5"
      >
        {!dt.activity.isInitialLoading && !tableMeta.canCreateProject ? (
          <Alert className="border-amber-500/20 bg-amber-500/10 text-amber-500 [&>svg]:text-amber-500">
            <AlertTriangle className="size-4" aria-hidden />
            <AlertDescription className="text-amber-500/90">
              当前租户策略不允许创建项目，如需开放请联系 Tenant Admin 调整配置。
            </AlertDescription>
          </Alert>
        ) : null}

        <TenantProjectsFilterPanel
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          environment={dt.filters.state.environment}
          ownerId={dt.filters.state.ownerId}
          costRange={dt.filters.state.costRange}
          ownerOptions={tableMeta.ownerOptions}
          onEnvironmentChange={(value) => dt.filters.set("environment", value)}
          onOwnerChange={(value) => dt.filters.set("ownerId", value)}
          onCostRangeChange={(value) => dt.filters.set("costRange", value)}
          onRefresh={() => {
            void dt.actions.refetch()
          }}
          onReset={() => {
            setSearchInput("")
            dt.filters.setBatch({
              q: "",
              environment: null,
              ownerId: null,
              costRange: null,
            })
          }}
          refreshing={isRefreshing}
          hasActiveFilters={hasActiveFilters}
          pageStart={pageStart}
          pageEnd={pageEnd}
          totalProjects={totalProjects}
          isFetching={isFetchingOnly}
          environmentSummary={environmentSummary}
          activeFilterLabels={activeFilterLabels}
        />

        {!dt.activity.isInitialLoading && dt.status.type !== "error" ? (
          <TenantProjectsGlobalMetrics projects={projects} />
        ) : null}

        {dt.status.type === "error" ? (
          <ErrorState
            title="项目列表加载失败"
            message="无法获取项目列表，请稍后重试。"
            error={dt.errors?.blocking?.original ?? dt.errors?.nonBlocking?.original}
            onRetry={() => {
              void dt.actions.retry()
            }}
          />
        ) : dt.activity.isInitialLoading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {[0, 1, 2, 3, 4, 5].map((id) => (
              <TenantProjectCardSkeleton key={`skeleton-${id}`} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            title="暂无匹配项目"
            description="可以调整筛选条件，或新建一个项目开始配置服务。"
            {...(tableMeta.canCreateProject
              ? {
                  primaryAction: {
                    label: "创建项目",
                    onClick: () => setCreateDialogOpen(true),
                  },
                }
              : {})}
          />
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.05 },
              },
            }}
            className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          >
            {projects.map((project) => (
              <motion.div
                key={project.projectId}
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
              >
                <TenantProjectCard
                  tenantId={tenantId}
                  project={project}
                  canManageProject={tableMeta.canCreateProject}
                  onOpenSettings={(item) => {
                    toast.info(`项目 ${item.projectName} 的设置页将在 P3.2 阶段实现。`)
                  }}
                  onOpenLogs={(item) => {
                    toast.info(`项目 ${item.projectName} 的控制台日志将在 P3.2 阶段实现。`)
                  }}
                  onRequestDelete={setDeletingProject}
                />
              </motion.div>
            ))}
            {tableMeta.canCreateProject ? (
              <CreateProjectPlaceholderCard onClick={() => setCreateDialogOpen(true)} />
            ) : null}
          </motion.div>
        )}

        <TenantProjectsPagination
          currentPage={dt.pagination.page}
          pageCount={dt.pagination.pageCount}
          onPageChange={(page) => dt.actions.setPage(page)}
        />
      </ContentLayout>

      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        canCreateProject={tableMeta.canCreateProject}
        existingProjectNames={tableMeta.existingProjectNames}
        memberCandidates={tableMeta.memberCandidates}
        submitting={createMutation.isPending}
        onSubmit={async (input) => {
          try {
            const response = await createMutation.mutateAsync({
              tenantId,
              ...input,
            })
            const createdProject = response.project

            toast.success("项目创建成功", {
              action: {
                label: "进入项目",
                onClick: () => {
                  void navigate({
                    to: buildProjectPath(tenantId, createdProject.projectId, "/dashboard"),
                  })
                },
              },
            })
          } catch (error) {
            toast.error(toErrorMessage(error))
            throw error
          }
        }}
      />

      <DeleteProjectDialog
        open={Boolean(deletingProject)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setDeletingProject(null)
          }
        }}
        project={deletingProject}
        submitting={deleteMutation.isPending}
        onConfirm={async (project) => {
          try {
            await deleteMutation.mutateAsync({
              tenantId,
              projectId: project.projectId,
            })
            toast.success(`项目 ${project.projectName} 已删除`)
            setDeletingProject(null)
          } catch (error) {
            toast.error(toErrorMessage(error))
          }
        }}
      />
    </>
  )
}
