import { Plus, RefreshCcw } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { buildProjectPath } from "@/components/workspace/workspace-context"
import {
  DangerConfirmDialog,
  EmptyState,
  ErrorState,
  IdBadge,
  StatusBadge,
} from "@/features/shared/components"
import { ContentLayout } from "@/packages/layout-core"
import { BaseLink } from "@/packages/platform-router"
import { Badge } from "@/packages/ui/badge"
import { Button } from "@/packages/ui/button"
import { Skeleton } from "@/packages/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/packages/ui/table"
import {
  useProjectServiceActions,
  useProjectServicesQuery,
  useProjectServiceWizardOptionsQuery,
} from "../hooks"
import type { ServiceFilterState } from "../types"
import { CreateServiceWizard } from "./create-service-wizard"
import { formatDateTime, formatPercent, toErrorMessage } from "./service-formatters"
import { ServiceListFilters } from "./service-list-filters"

interface ProjectServicesPageProps {
  tenantId: string
  projectId: string
}

const DEFAULT_FILTERS: ServiceFilterState = {
  q: "",
  env: "All",
  state: "All",
  runtime: "All",
  model: "All",
  onlyInactive: "all",
  errorRateRange: "all",
}

export function ProjectServicesPage({ tenantId, projectId }: ProjectServicesPageProps) {
  const [filters, setFilters] = useState<ServiceFilterState>(DEFAULT_FILTERS)
  const [createOpen, setCreateOpen] = useState(false)
  const [deletingService, setDeletingService] = useState<{
    serviceId: string
    name: string
  } | null>(null)

  const listQuery = useProjectServicesQuery(tenantId, projectId, filters)
  const wizardOptionsQuery = useProjectServiceWizardOptionsQuery(tenantId, projectId)
  const actions = useProjectServiceActions({ tenantId, projectId })

  const modelOptions = useMemo(() => {
    const set = new Set<string>()
    for (const row of listQuery.data ?? []) {
      set.add(row.modelVersionId)
    }
    return Array.from(set)
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
        创建服务
      </Button>
    </div>
  )

  return (
    <>
      <ContentLayout
        title="推理服务"
        description="管理服务生命周期、流量策略与在线可观测数据。"
        actions={headerActions}
      >
        <ServiceListFilters
          filters={filters}
          modelOptions={modelOptions}
          onChange={setFilters}
          onReset={() => setFilters(DEFAULT_FILTERS)}
        />

        {listQuery.isError ? (
          <ErrorState
            title="服务列表加载失败"
            message="暂时无法获取服务列表，请稍后重试。"
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
                  <TableHead>名称</TableHead>
                  <TableHead>env</TableHead>
                  <TableHead>current state</TableHead>
                  <TableHead>desired state</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>模型版本</TableHead>
                  <TableHead>Runtime</TableHead>
                  <TableHead>Replicas</TableHead>
                  <TableHead>1h QPS / P95 / 错误率</TableHead>
                  <TableHead>更新时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listQuery.data.map((item) => (
                  <TableRow key={item.serviceId} className="transition-colors hover:bg-muted/50">
                    <TableCell>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.env}</Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.currentState} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={item.desiredState === "Active" ? "default" : "outline"}
                        className="text-xs"
                      >
                        {item.desiredState}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[180px]">
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {item.endpoint}
                      </p>
                    </TableCell>
                    <TableCell>
                      <IdBadge id={item.modelVersionId} />
                    </TableCell>
                    <TableCell>{item.runtime}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.replicas.current}（{item.replicas.min}-{item.replicas.max}）
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.metrics1h.qps.toFixed(2)} / {item.metrics1h.p95Ms.toFixed(2)}ms /
                      {formatPercent(item.metrics1h.errorRate)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(item.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline" className="cursor-pointer">
                          <BaseLink
                            to={buildProjectPath(
                              tenantId,
                              projectId,
                              `/services/${item.serviceId}`,
                            )}
                          >
                            详情
                          </BaseLink>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="cursor-pointer"
                          onClick={() => {
                            void actions.toggleDesiredStateMutation
                              .mutateAsync({
                                tenantId,
                                projectId,
                                serviceId: item.serviceId,
                                desiredState:
                                  item.desiredState === "Active" ? "Inactive" : "Active",
                              })
                              .catch((error: unknown) => {
                                toast.error(toErrorMessage(error))
                              })
                          }}
                        >
                          {item.desiredState === "Active" ? "停用" : "启用"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="cursor-pointer text-destructive"
                          onClick={() =>
                            setDeletingService({ serviceId: item.serviceId, name: item.name })
                          }
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
        ) : null}

        {!listQuery.isPending && !listQuery.isError && listQuery.data?.length === 0 ? (
          <EmptyState
            title="还没有推理服务"
            description="创建一个服务将模型部署为 API 端点。"
            primaryAction={{
              label: "创建服务",
              onClick: () => setCreateOpen(true),
            }}
          />
        ) : null}
      </ContentLayout>

      <CreateServiceWizard
        open={createOpen}
        onOpenChange={setCreateOpen}
        tenantId={tenantId}
        projectId={projectId}
        options={wizardOptionsQuery.data}
        submitting={actions.createServiceMutation.isPending}
        onSubmit={async (payload) => {
          try {
            await actions.createServiceMutation.mutateAsync(payload)
          } catch (error: unknown) {
            toast.error(toErrorMessage(error))
            throw error
          }
        }}
      />

      <DangerConfirmDialog
        open={Boolean(deletingService)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingService(null)
          }
        }}
        targetName={deletingService?.name ?? ""}
        title="删除服务"
        description="删除后 endpoint 将不可用，且不会自动清理关联 API Key。"
        confirmLabel="确认删除"
        onConfirm={async () => {
          if (!deletingService) {
            return
          }
          try {
            await actions.deleteServiceMutation.mutateAsync({
              tenantId,
              projectId,
              serviceId: deletingService.serviceId,
              confirmName: deletingService.name,
            })
            setDeletingService(null)
          } catch (error: unknown) {
            toast.error(toErrorMessage(error))
            throw error
          }
        }}
      />
    </>
  )
}
