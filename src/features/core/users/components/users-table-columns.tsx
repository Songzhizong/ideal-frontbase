import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { getSelectColumn } from "@/components/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { UserGroupBadges } from "@/features/core/users"
import type { User } from "../types"
import { UserStatusEnum } from "../types"

export const usersTableColumns: ColumnDef<User>[] = [
  getSelectColumn<User>(),
  {
    accessorKey: "username",
    header: "用户",
    meta: {
      label: "用户",
    },
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <div className="font-medium text-foreground">{row.getValue("username")}</div>
        <div className="text-sm text-muted-foreground">{row.original.email}</div>
      </div>
    ),
  },
  {
    accessorKey: "userGroups",
    header: "用户组",
    meta: {
      label: "用户组",
    },
    cell: ({ row }) => <UserGroupBadges userGroups={row.getValue("userGroups")} />,
    enableSorting: false,
  },
  {
    accessorKey: "phone",
    header: "联系方式",
    meta: {
      label: "联系方式",
    },
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <div className="text-sm">{row.getValue("phone")}</div>
        <div className="text-sm text-muted-foreground">{row.original.email}</div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "状态",
    meta: {
      label: "状态",
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as User["status"]
      return (
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {UserStatusEnum[status]}
        </Badge>
      )
    },
  },
  {
    accessorKey: "mfaEnabled",
    header: "MFA",
    meta: {
      label: "MFA",
    },
    cell: ({ row }) => {
      const mfaEnabled = row.getValue("mfaEnabled") as boolean
      return (
        <div className="flex items-center gap-2">
          <Switch checked={mfaEnabled} disabled />
          <span className="text-sm text-muted-foreground">{mfaEnabled ? "已启用" : "未启用"}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "lastVisit",
    header: "最近访问",
    meta: {
      label: "最近访问",
    },
    cell: ({ row }) => {
      const lastVisit = row.getValue("lastVisit") as string
      return <div className="text-sm text-muted-foreground">{lastVisit || "从未访问"}</div>
    },
  },
  {
    id: "actions",
    header: "操作",
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>编辑</DropdownMenuItem>
            <DropdownMenuItem>更多</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]
