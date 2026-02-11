import { useEffect, useMemo, useState } from "react"
import { ContentLayout } from "@/components/content-layout"
import { EmptyState, ErrorState } from "@/features/shared/components"
import { Skeleton } from "@/packages/ui/skeleton"
import { useTenantAuditLogsQuery } from "../hooks"
import type { TenantAuditTableFilters } from "../types/tenant-audit"
import { TenantAuditDetailDrawer } from "./tenant-audit-detail-drawer"
import { TenantAuditFilters } from "./tenant-audit-filters"
import { TenantAuditTable } from "./tenant-audit-table"

interface TenantAuditPageProps {
  tenantId: string
  title?: string
  description?: string
  lockedProjectId?: string
  showProjectFilter?: boolean
}

function createDefaultFilters(lockedProjectId: string | null): TenantAuditTableFilters {
  return {
    actorType: null,
    actorQuery: "",
    action: null,
    resourceType: null,
    projectId: lockedProjectId,
    startTimeMs: null,
    endTimeMs: null,
  }
}

function formatPageRange(page: number, size: number, total: number, current: number) {
  if (total === 0 || current === 0) {
    return "0 / 0"
  }
  const start = (page - 1) * size + 1
  const end = Math.min(start + current - 1, total)
  return `${start}-${end} / ${total}`
}

function AuditTableLoading() {
  return (
    <div className="space-y-2 rounded-lg border border-border/50 bg-card p-4">
      {[0, 1, 2, 3, 4, 5].map((item) => (
        <Skeleton key={item} className="h-10 w-full" />
      ))}
    </div>
  )
}

export function TenantAuditPage({
  tenantId,
  title = "租户审计",
  description = "按时间、Actor、动作与资源维度检索租户审计事件，并支持查看 before/after 变更细节。",
  lockedProjectId,
  showProjectFilter = true,
}: TenantAuditPageProps) {
  const defaultFilters = useMemo(
    () => createDefaultFilters(lockedProjectId ?? null),
    [lockedProjectId],
  )
  const [page, setPage] = useState(1)
  const [size, setSize] = useState<10 | 20 | 50>(20)
  const [filters, setFilters] = useState<TenantAuditTableFilters>(defaultFilters)
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)

  useEffect(() => {
    setPage(1)
    setFilters(defaultFilters)
  }, [defaultFilters])

  const logsQuery = useTenantAuditLogsQuery({
    tenantId,
    page,
    size,
    filters,
  })

  const rows = logsQuery.data?.content ?? []
  const totalElements = logsQuery.data?.totalElements ?? 0
  const totalPages = logsQuery.data?.totalPages ?? 1

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.actorType ||
        filters.actorQuery.trim() ||
        filters.action ||
        filters.resourceType ||
        (!lockedProjectId && filters.projectId) ||
        filters.startTimeMs ||
        filters.endTimeMs,
    )
  }, [filters, lockedProjectId])

  const pageRangeLabel = useMemo(() => {
    return formatPageRange(page, size, totalElements, rows.length)
  }, [page, rows.length, size, totalElements])

  const handleFilterChange = <K extends keyof TenantAuditTableFilters>(
    key: K,
    value: TenantAuditTableFilters[K],
  ) => {
    setPage(1)
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <>
      <ContentLayout title={title} description={description}>
        <TenantAuditFilters
          filters={filters}
          actionOptions={logsQuery.data?.actionOptions ?? []}
          resourceTypeOptions={logsQuery.data?.resourceTypeOptions ?? []}
          projectOptions={logsQuery.data?.projectOptions ?? []}
          showProjectFilter={showProjectFilter}
          hasActiveFilters={hasActiveFilters}
          refreshing={logsQuery.isFetching}
          onActorQueryChange={(value) => handleFilterChange("actorQuery", value)}
          onActorTypeChange={(value) => handleFilterChange("actorType", value)}
          onActionChange={(value) => handleFilterChange("action", value)}
          onResourceTypeChange={(value) => handleFilterChange("resourceType", value)}
          onProjectChange={(value) => handleFilterChange("projectId", value)}
          onDateRangeChange={(startTimeMs, endTimeMs) => {
            handleFilterChange("startTimeMs", startTimeMs)
            handleFilterChange("endTimeMs", endTimeMs)
          }}
          onReset={() => {
            setPage(1)
            setFilters(defaultFilters)
          }}
          onRefresh={() => {
            void logsQuery.refetch()
          }}
        />

        {logsQuery.isPending ? (
          <AuditTableLoading />
        ) : logsQuery.isError ? (
          <ErrorState
            title="审计日志加载失败"
            message="无法获取租户审计数据，请稍后重试。"
            error={logsQuery.error}
            onRetry={() => {
              void logsQuery.refetch()
            }}
          />
        ) : rows.length === 0 ? (
          <EmptyState
            title="暂无审计记录"
            description="当前筛选条件下没有匹配的审计事件，请调整条件后重试。"
          />
        ) : (
          <TenantAuditTable
            rows={rows}
            page={page}
            totalPages={totalPages}
            size={size}
            pageRangeLabel={pageRangeLabel}
            onPageChange={setPage}
            onSizeChange={(nextSize) => {
              setSize(nextSize)
              setPage(1)
            }}
            onViewDetail={setSelectedLogId}
          />
        )}
      </ContentLayout>

      <TenantAuditDetailDrawer
        tenantId={tenantId}
        logId={selectedLogId}
        open={selectedLogId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedLogId(null)
          }
        }}
      />
    </>
  )
}
