import { format } from "date-fns"
import { MoreHorizontal, Shield, UserCog, UserX } from "lucide-react"
import { useMemo, useState } from "react"
import { StatusBadge } from "@/features/shared/components"
import {
  createColumnHelper,
  DataTablePagination,
  DataTableRoot,
  DataTableTable,
  remote,
  type TableStateAdapter,
  useDataTable,
} from "@/packages/table"
import { Button } from "@/packages/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/packages/ui/dropdown-menu"
import { getTenantUsers } from "../api"
import { useTenantUserActions, useTenantUsersTableState } from "../hooks"
import type { TenantUserItem, TenantUserRole, TenantUsersTableFilters } from "../types/tenant-users"
import { EditRoleDialog } from "./edit-role-dialog"

const helper = createColumnHelper<TenantUserItem>()

export function UsersTable({ tenantId }: { tenantId: string }) {
  const state = useTenantUsersTableState(tenantId)
  const actions = useTenantUserActions(tenantId)
  const [editingUser, setEditingUser] = useState<TenantUserItem | null>(null)

  const columns = useMemo(
    () => [
      helper.accessor("displayName", {
        header: "用户",
        cell: (info) => (
          <div className="flex flex-col py-1">
            <span className="font-medium text-sm text-foreground">
              {info.getValue() || "未设置姓名"}
            </span>
            <span className="text-xs text-muted-foreground">{info.row.original.email}</span>
          </div>
        ),
      }),
      helper.accessor("role", {
        header: "角色",
        cell: (info) => <span className="text-sm">{info.getValue()}</span>,
      }),
      helper.accessor("status", {
        header: "状态",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      helper.accessor("lastLoginAt", {
        header: "最近登录",
        cell: (info) => {
          const value = info.getValue()
          return (
            <span className="text-xs text-muted-foreground tabular-nums">
              {value ? format(new Date(value), "yyyy-MM-dd HH:mm") : "-"}
            </span>
          )
        },
      }),
      helper.display({
        id: "__actions__",
        cell: (info) => {
          const user = info.row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 cursor-pointer">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>操作</DropdownMenuLabel>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setEditingUser(user)}>
                  <Shield className="mr-2 h-4 w-4" />
                  修改角色
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {user.status === "Disabled" ? (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() =>
                      actions.toggleStatus.mutate({ tenantId, userId: user.id, status: "Active" })
                    }
                  >
                    <UserCog className="mr-2 h-4 w-4" />
                    启用账号
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer"
                    onClick={() =>
                      actions.toggleStatus.mutate({ tenantId, userId: user.id, status: "Disabled" })
                    }
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    禁用账号
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      }),
    ],
    [tenantId, actions],
  )

  const dataSource = useMemo(() => {
    return remote<
      TenantUserItem,
      TenantUsersTableFilters,
      Awaited<ReturnType<typeof getTenantUsers>>
    >({
      queryKey: ["tenant-users", tenantId],
      queryFn: ({ page, size, filters }) => getTenantUsers({ tenantId, page, size, filters }),
      map: (res) => ({
        rows: res.content,
        pageCount: res.totalPages,
        total: res.totalElements,
      }),
    })
  }, [tenantId])

  const dt = useDataTable<TenantUserItem, TenantUsersTableFilters>({
    columns,
    dataSource,
    state: state as unknown as TableStateAdapter<TenantUsersTableFilters>,
    getRowId: (r) => r.id,
    features: {
      pinning: {
        enabled: true,
        right: ["__actions__"],
      },
    },
  })

  return (
    <div className="space-y-4">
      <DataTableRoot dt={dt}>
        <DataTableTable className="border border-border/50 rounded-lg overflow-hidden" />
        <DataTablePagination />
      </DataTableRoot>

      <EditRoleDialog
        user={editingUser}
        open={!!editingUser}
        onOpenChange={(open: boolean) => !open && setEditingUser(null)}
        onConfirm={(role: TenantUserRole) => {
          if (editingUser) {
            actions.updateRole.mutate({ tenantId, userId: editingUser.id, role })
            setEditingUser(null)
          }
        }}
        submitting={actions.updateRole.isPending}
      />
    </div>
  )
}
