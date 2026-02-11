import { format } from "date-fns"
import { MoreHorizontal, RotateCw, Trash2 } from "lucide-react"
import { useMemo } from "react"
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
import { getTenantInvitations } from "../api"
import { useTenantInvitationsTableState, useTenantUserActions } from "../hooks"
import type { TenantInvitationItem, TenantInvitationsTableFilters } from "../types/tenant-users"

const helper = createColumnHelper<TenantInvitationItem>()

export function InvitationsTable({ tenantId }: { tenantId: string }) {
  const state = useTenantInvitationsTableState(tenantId)
  const actions = useTenantUserActions(tenantId)

  const columns = useMemo(
    () => [
      helper.accessor("email", {
        header: "邮箱",
        cell: (info) => (
          <span className="font-medium text-sm text-foreground">{info.getValue()}</span>
        ),
      }),
      helper.accessor("role", {
        header: "邀请角色",
        cell: (info) => <span className="text-sm">{info.getValue()}</span>,
      }),
      helper.accessor("status", {
        header: "状态",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      helper.accessor("createdAt", {
        header: "发送时间",
        cell: (info) => (
          <span className="text-xs text-muted-foreground tabular-nums">
            {format(new Date(info.getValue()), "yyyy-MM-dd HH:mm")}
          </span>
        ),
      }),
      helper.display({
        id: "__actions__",
        cell: (info) => {
          const inv = info.row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 cursor-pointer">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>操作</DropdownMenuLabel>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() =>
                    actions.resendInvitation.mutate({ tenantId, invitationId: inv.id })
                  }
                >
                  <RotateCw className="mr-2 h-4 w-4" />
                  重新发送
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive cursor-pointer"
                  onClick={() =>
                    actions.deleteInvitation.mutate({ tenantId, invitationId: inv.id })
                  }
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  撤销邀请
                </DropdownMenuItem>
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
      TenantInvitationItem,
      TenantInvitationsTableFilters,
      Awaited<ReturnType<typeof getTenantInvitations>>
    >({
      queryKey: ["tenant-invitations", tenantId],
      queryFn: ({ page, size, filters }) => getTenantInvitations({ tenantId, page, size, filters }),
      map: (res) => ({
        rows: res.content,
        pageCount: res.totalPages,
        total: res.totalElements,
      }),
    })
  }, [tenantId])

  const dt = useDataTable<TenantInvitationItem, TenantInvitationsTableFilters>({
    columns,
    dataSource,
    state: state as unknown as TableStateAdapter<TenantInvitationsTableFilters>,
    getRowId: (r) => r.id,
    features: {
      pinning: {
        enabled: true,
        right: ["__actions__"],
      },
    },
  })

  return (
    <DataTableRoot dt={dt}>
      <DataTableTable className="border border-border/50 rounded-lg overflow-hidden" />
      <DataTablePagination />
    </DataTableRoot>
  )
}
