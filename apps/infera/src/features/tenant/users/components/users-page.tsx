import { RefreshCw } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import type { UserManagementTableFilters } from "@/features/tenant/users"
import { useConfirm } from "@/hooks"
import { ContentLayout } from "@/packages/layout-core"
import {
  createCrudQueryPreset,
  DataTablePreset,
  DataTableViewOptions,
  type FilterDefinition,
  remote,
  useDataTable,
} from "@/packages/table"
import { Button } from "@/packages/ui/button"
import { cn } from "@/packages/ui-utils"
import { type Api, fetchGetUserList, fetchGetUserUnmask } from "../api/user-management"
import {
  USER_MANAGEMENT_QUERY_KEY,
  useUserManagementActions,
  useUserManagementTableState,
} from "../hooks"
import { UserCreateEditSheet } from "./user-create-edit-sheet"
import { UserGroupsDialog } from "./user-groups-dialog"
import { useUserManagementColumns } from "./user-management-columns"
import { UserManagementStatsCards } from "./user-management-stats-cards"
import { UserPasswordDialog } from "./user-password-dialog"
import { UserTableEmpty } from "./user-table-empty"
import { UserUnmaskDialog } from "./user-unmask-dialog"

interface UsersPageProps {
  tenantId: string
}

interface UserEditorState {
  open: boolean
  mode: "create" | "edit"
  user: Api.User.ListUser | null
}

interface UnmaskState {
  open: boolean
  loading: boolean
  detail: Api.User.UserDetail | null
}

const ADVANCED_SEARCH_FIELDS: Array<FilterDefinition<UserManagementTableFilters>> = [
  {
    key: "blocked",
    label: "状态",
    type: "select",
    placeholder: "状态",
    options: [
      { label: "全部", value: "" },
      { label: "正常", value: "false" },
      { label: "已锁定", value: "true" },
    ],
  },
  {
    key: "mfaEnabled",
    label: "MFA",
    type: "select",
    placeholder: "MFA状态",
    options: [
      { label: "全部", value: "" },
      { label: "已开启", value: "true" },
      { label: "未开启", value: "false" },
    ],
  },
]

const ACTIVE_FILTER_FIELDS: Array<FilterDefinition<UserManagementTableFilters>> = [
  {
    key: "keyword",
    label: "关键字",
    type: "text",
  },
  ...ADVANCED_SEARCH_FIELDS,
]

export function UsersPage({ tenantId }: UsersPageProps) {
  const { confirm } = useConfirm()
  const state = useUserManagementTableState(tenantId)
  const actions = useUserManagementActions(tenantId)

  const [editorState, setEditorState] = useState<UserEditorState>({
    open: false,
    mode: "create",
    user: null,
  })
  const [passwordUser, setPasswordUser] = useState<Api.User.ListUser | null>(null)
  const [groupUser, setGroupUser] = useState<Api.User.ListUser | null>(null)
  const [unmaskState, setUnmaskState] = useState<UnmaskState>({
    open: false,
    loading: false,
    detail: null,
  })

  const dataSource = useMemo(() => {
    return remote<Api.User.ListUser, UserManagementTableFilters, Api.User.UserList>({
      queryKey: [USER_MANAGEMENT_QUERY_KEY, tenantId],
      queryFn: ({ page, size, filters }) =>
        fetchGetUserList({
          pageNumber: page,
          pageSize: size,
          keyword: filters.keyword.trim() || null,
          blocked:
            filters.blocked === "true" || filters.blocked === "false" ? filters.blocked : null,
          mfaEnabled:
            filters.mfaEnabled === "true" || filters.mfaEnabled === "false"
              ? filters.mfaEnabled
              : null,
        }),
      map: (response) => ({
        rows: response.content,
        pageCount: response.totalPages,
        total: response.totalElements,
      }),
    })
  }, [tenantId])

  const handleOpenCreate = useCallback(() => {
    setEditorState({
      open: true,
      mode: "create",
      user: null,
    })
  }, [])

  const handleOpenEdit = useCallback((user: Api.User.ListUser) => {
    setEditorState({
      open: true,
      mode: "edit",
      user,
    })
  }, [])

  const handleToggleBlock = useCallback(
    async (user: Api.User.ListUser) => {
      if (user.blocked) {
        await actions.unblockUser.mutateAsync(user.id)
        return
      }
      await actions.blockUser.mutateAsync(user.id)
    },
    [actions.blockUser, actions.unblockUser],
  )

  const handleShowUnmask = useCallback(async (user: Api.User.ListUser) => {
    setUnmaskState({
      open: true,
      loading: true,
      detail: null,
    })
    try {
      const detail = await fetchGetUserUnmask(user.id)
      setUnmaskState({
        open: true,
        loading: false,
        detail,
      })
    } catch {
      setUnmaskState({
        open: true,
        loading: false,
        detail: null,
      })
      toast.error("加载明文信息失败")
    }
  }, [])

  const handleDelete = useCallback(
    async (user: Api.User.ListUser) => {
      const confirmed = await confirm({
        title: "删除用户",
        description: `确认删除用户“${user.name}”吗？该操作不可撤销。`,
        confirmText: "确认删除",
        cancelText: "取消",
        variant: "destructive",
      })
      if (!confirmed) return
      await actions.deleteUser.mutateAsync(user.id)
    },
    [actions.deleteUser, confirm],
  )

  const columnActions = useMemo(
    () => ({
      onEdit: handleOpenEdit,
      onSetPassword: setPasswordUser,
      onShowUnmask: handleShowUnmask,
      onToggleBlock: handleToggleBlock,
      onChangeGroups: setGroupUser,
      onDelete: handleDelete,
    }),
    [handleDelete, handleOpenEdit, handleShowUnmask, handleToggleBlock],
  )

  const columns = useUserManagementColumns(columnActions)

  const dt = useDataTable<Api.User.ListUser, UserManagementTableFilters>({
    columns,
    dataSource,
    state,
    getRowId: (row) => row.id,
    features: {
      density: {
        enabled: true,
        default: "comfortable",
        storageKey: `infera_user_mgmt_density_${tenantId}`,
      },
      pinning: {
        enabled: true,
        right: ["__actions__"],
        storageKey: `infera_user_mgmt_pinning_${tenantId}`,
      },
    },
  })

  const isRefreshing = dt.activity.isInitialLoading || dt.activity.isFetching
  const currentRows = dt.table.getRowModel().rows.map((row) => row.original)
  const userStats = useMemo(() => {
    const totalUsers = dt.pagination.total ?? currentRows.length
    const activeUsers = currentRows.filter((user) => !user.blocked).length
    const mfaEnabledUsers = currentRows.filter((user) => user.mfaEnabled).length
    const mfaBaseUsers = currentRows.length
    const mfaRatio = mfaBaseUsers === 0 ? 0 : Math.round((mfaEnabledUsers / mfaBaseUsers) * 100)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const newUsers = currentRows.filter((user) => user.createdTime >= thirtyDaysAgo).length

    return {
      totalUsers,
      activeUsers,
      mfaEnabledUsers,
      mfaBaseUsers,
      mfaRatio,
      newUsers,
    }
  }, [currentRows, dt.pagination.total])

  return (
    <>
      <ContentLayout
        title="用户管理"
        description="管理系统内的所有用户账户、权限组及安全状态。"
        className="min-h-full"
      >
        <UserManagementStatsCards
          totalUsers={userStats.totalUsers}
          activeUsers={userStats.activeUsers}
          mfaEnabledUsers={userStats.mfaEnabledUsers}
          mfaBaseUsers={userStats.mfaBaseUsers}
          mfaRatio={userStats.mfaRatio}
          newUsers={userStats.newUsers}
        />

        <section className="rounded-2xl border border-border/40 bg-card shadow-sm transition-shadow duration-300 hover:shadow-md">
          <DataTablePreset<Api.User.ListUser, UserManagementTableFilters>
            dt={dt}
            layout={{ stickyQueryPanel: true, stickyHeader: true, stickyPagination: true }}
            query={createCrudQueryPreset<UserManagementTableFilters>({
              search: {
                filterKey: "keyword",
                mode: "advanced",
                advancedFields: ADVANCED_SEARCH_FIELDS,
                placeholder: "搜索姓名、账号、手机或邮箱...",
                className: "max-w-md",
              },
              activeFilters: ACTIVE_FILTER_FIELDS,
              actions: (
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleOpenCreate} className="h-9 px-3 text-sm font-medium">
                    <span className="mr-1 text-base font-light">+</span> 新增用户
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 border border-border/50 bg-muted/20 text-muted-foreground shadow-none hover:bg-muted/30 hover:text-foreground"
                    onClick={() => dt.actions.refetch()}
                    aria-label="刷新"
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                  </Button>
                  <DataTableViewOptions />
                </div>
              ),
            })}
            table={{
              renderEmpty: () => <UserTableEmpty />,
            }}
            pagination={{
              pageSizeOptions: [10, 20, 50, 100],
            }}
          />
        </section>
      </ContentLayout>

      <UserCreateEditSheet
        open={editorState.open}
        mode={editorState.mode}
        user={editorState.user}
        submitting={actions.createUser.isPending || actions.updateUser.isPending}
        onOpenChange={(open) => setEditorState((prev) => ({ ...prev, open }))}
        onCreate={async (values) => {
          await actions.createUser.mutateAsync(values)
        }}
        onUpdate={async (userId, values) => {
          await actions.updateUser.mutateAsync({ userId, input: values })
        }}
      />

      <UserPasswordDialog
        open={!!passwordUser}
        user={passwordUser}
        submitting={actions.setPassword.isPending}
        onOpenChange={(open) => {
          if (!open) setPasswordUser(null)
        }}
        onSubmit={async (userId, values) => {
          await actions.setPassword.mutateAsync({
            userId,
            newPassword: values.newPassword,
            changeOnFirstLogin: values.changeOnFirstLogin,
          })
        }}
      />

      <UserGroupsDialog
        open={!!groupUser}
        user={groupUser}
        submitting={actions.changeUserGroups.isPending}
        onOpenChange={(open) => {
          if (!open) setGroupUser(null)
        }}
        onSubmit={async (userId, userGroupIds) => {
          await actions.changeUserGroups.mutateAsync({
            userId,
            userGroupIds,
          })
        }}
      />

      <UserUnmaskDialog
        open={unmaskState.open}
        loading={unmaskState.loading}
        detail={unmaskState.detail}
        onOpenChange={(open) => setUnmaskState((prev) => ({ ...prev, open }))}
      />
    </>
  )
}
