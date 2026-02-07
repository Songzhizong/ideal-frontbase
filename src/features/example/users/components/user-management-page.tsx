import { Activity, AlertTriangle, Download, Plus, RefreshCw, UserPlus, Users } from "lucide-react"
import { useCallback, useMemo } from "react"
import { PageContainer } from "@/components/common/page-container"
import type { DataTableSelectionExportPayload } from "@/components/table/v2"
import { DataTablePreset, DataTableViewOptions, remote, useDataTable } from "@/components/table/v2"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/features/dashboard/components/stats-card"
import { useBaseNavigate } from "@/hooks/use-base-navigate"
import { cn } from "@/lib/utils"
import { DEMO_USERS, fetchDemoUsers, filterDemoUsers } from "../demo/users"
import type { DemoUser, DemoUserFilters } from "../types"
import { useUserManagementTableState } from "./use-user-management-table-state"
import { buildUserCsvRows, downloadCsvFile } from "./user-management-csv"
import {
  buildActiveUserFilterDefinitions,
  buildExpandableUserFilterDefinitions,
  buildToolbarUserFilterDefinitions,
  buildUserFilterDefinitions,
  ROLE_LABEL,
  STATUS_LABEL,
} from "./user-management-filters"
import { demoUserTableColumns } from "./user-table-columns"

export function UserManagementPage() {
  const navigate = useBaseNavigate()

  const state = useUserManagementTableState()

  const demoUsersById = useMemo(() => {
    const map = new Map<string, DemoUser>()
    for (const user of DEMO_USERS) {
      map.set(user.id, user)
    }
    return map
  }, [])

  const fetchAllMatchingIds = useCallback(async (filters: DemoUserFilters) => {
    return filterDemoUsers(DEMO_USERS, filters).map((user) => user.id)
  }, [])

  const dataSource = useMemo(() => {
    return remote<DemoUser, DemoUserFilters, Awaited<ReturnType<typeof fetchDemoUsers>>>({
      queryKey: ["example-users-management-v2"],
      queryFn: fetchDemoUsers,
      map: (response) => response,
    })
  }, [])

  const dt = useDataTable<DemoUser, DemoUserFilters>({
    columns: demoUserTableColumns,
    dataSource,
    state,
    getRowId: (row) => row.id,
    features: {
      selection: {
        enabled: true,
        mode: "cross-page",
        crossPage: {
          selectAllStrategy: "server",
          fetchAllIds: fetchAllMatchingIds,
          maxSelection: 5000,
        },
      },
      columnVisibility: {
        enabled: true,
        storageKey: "example_users_v2_visibility",
      },
      columnSizing: {
        enabled: true,
        storageKey: "example_users_v2_sizing",
      },
      density: {
        enabled: true,
        storageKey: "example_users_v2_density",
        default: "comfortable",
      },
      pinning: {
        enabled: true,
        left: ["__select__", "name"],
        right: ["__actions__"],
        storageKey: "example_users_v2_pinning",
      },
    },
  })

  const filterDefinitions = useMemo(() => buildUserFilterDefinitions(), [])
  const quickFilterDefinitions = useMemo(() => buildToolbarUserFilterDefinitions(), [])
  const expandableFilterDefinitions = useMemo(() => buildExpandableUserFilterDefinitions(), [])

  const activeFilterDefinitions = useMemo(() => {
    return buildActiveUserFilterDefinitions(filterDefinitions)
  }, [filterDefinitions])

  const isRefreshing = dt.activity.isInitialLoading || dt.activity.isFetching

  const metrics = useMemo(() => {
    const totalUsers = DEMO_USERS.length
    const onlineUsers = DEMO_USERS.filter((user) => user.isOnline).length
    const lockedUsers = DEMO_USERS.filter((user) => user.status === "locked").length
    const disabledUsers = DEMO_USERS.filter((user) => user.status === "disabled").length
    const abnormalUsers = lockedUsers + disabledUsers

    const now = Date.now()
    const weekStart = now - 7 * 24 * 60 * 60 * 1000
    const newThisWeek = DEMO_USERS.filter((user) => {
      const time = Date.parse(user.createdAt)
      return Number.isFinite(time) && time >= weekStart
    }).length

    return [
      {
        title: "总用户数",
        value: totalUsers.toLocaleString(),
        hint: "系统注册用户总数",
        icon: Users,
        accentClass: "text-info bg-info-subtle border-info/20",
      },
      {
        title: "当前在线",
        value: onlineUsers.toLocaleString(),
        hint: "模拟在线状态（mock）",
        icon: Activity,
        accentClass: "text-success bg-success-subtle border-success/20",
      },
      {
        title: "本周新增",
        value: newThisWeek.toLocaleString(),
        hint: "最近 7 天创建的用户",
        icon: UserPlus,
        accentClass: "text-primary bg-primary/10 border-primary/20",
      },
      {
        title: "异常账号",
        value: abnormalUsers.toLocaleString(),
        hint: "锁定 + 禁用（mock）",
        icon: AlertTriangle,
        accentClass: "text-error bg-error-subtle border-error/20",
      },
    ]
  }, [])

  const handleCreate = useCallback(() => {
    void navigate({ to: "/example/users/new" })
  }, [navigate])

  const handleExportCurrentPage = useCallback(() => {
    if (dt.status.type !== "ready") return
    const rows = dt.table.getRowModel().rows.map((row) => row.original)
    const filename = `users_page_${dt.pagination.page}_size_${dt.pagination.size}.csv`
    downloadCsvFile({
      filename,
      rows: buildUserCsvRows({
        users: rows,
        roleLabel: (role) => ROLE_LABEL[role],
        statusLabel: (status) => STATUS_LABEL[status],
      }),
    })
  }, [dt.pagination.page, dt.pagination.size, dt.status, dt.table])

  const resolveRowsByExportPayload = useCallback(
    (payload: DataTableSelectionExportPayload<DemoUserFilters>): DemoUser[] => {
      if (payload.type === "ids") {
        const rows: DemoUser[] = []
        for (const rowId of payload.rowIds) {
          const user = demoUsersById.get(rowId)
          if (user) {
            rows.push(user)
          }
        }
        return rows
      }

      const excludedRowIds = new Set(payload.excludedRowIds)
      return filterDemoUsers(DEMO_USERS, payload.filters).filter(
        (user) => !excludedRowIds.has(user.id),
      )
    },
    [demoUsersById],
  )

  const handleExportSelection = useCallback(
    (payload: DataTableSelectionExportPayload<DemoUserFilters>) => {
      const rows = resolveRowsByExportPayload(payload)
      if (rows.length === 0) return
      const filename =
        payload.type === "all"
          ? `users_all_matching_${rows.length}.csv`
          : `users_selected_${rows.length}.csv`

      downloadCsvFile({
        filename,
        rows: buildUserCsvRows({
          users: rows,
          roleLabel: (role) => ROLE_LABEL[role],
          statusLabel: (status) => STATUS_LABEL[status],
        }),
      })
    },
    [resolveRowsByExportPayload],
  )

  return (
    <PageContainer className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">用户管理</h1>
          <p className="text-sm text-muted-foreground">
            DataTablePreset 参考实现：远程数据源、URL 状态、搜索筛选、跨页选择与批量导出。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            disabled={isRefreshing || dt.status.type !== "ready"}
            onClick={handleExportCurrentPage}
          >
            <Download className="h-4 w-4" />
            导出当前页 CSV
          </Button>
          <Button type="button" className="gap-2" onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            新增用户
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <StatsCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            hint={metric.hint}
            icon={metric.icon}
            accentClass={metric.accentClass}
          />
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>用户列表（Table V2 默认示例）</CardTitle>
          <CardDescription>
            内置 220 条 mock 用户数据，覆盖搜索、筛选、列偏好、跨页批量选择与导出。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <DataTablePreset<DemoUser, DemoUserFilters>
            dt={dt}
            layout={{ stickyHeader: true, stickyPagination: true }}
            className="rounded-md border border-border/50"
            query={{
              className: "bg-transparent",
              search: {
                placeholder: "搜索姓名、邮箱、手机号",
              },
              quickFilters: quickFilterDefinitions,
              advancedFilters: expandableFilterDefinitions,
              activeFilters: activeFilterDefinitions,
              showActiveFilters: true,
              actions: (
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    className="h-8 w-8"
                    onClick={() => dt.actions.refetch()}
                    aria-label="刷新"
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                  </Button>
                  <DataTableViewOptions />
                </div>
              ),
            }}
            table={{
              renderEmpty: () => "暂无匹配用户",
            }}
            selectionBarActions={({ exportPayload }) => (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-2"
                onClick={() => handleExportSelection(exportPayload)}
              >
                <Download className="h-4 w-4" />
                导出已选（支持跨页）
              </Button>
            )}
          />
        </CardContent>
      </Card>
    </PageContainer>
  )
}
