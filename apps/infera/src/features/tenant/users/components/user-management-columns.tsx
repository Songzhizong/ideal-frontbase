import { BadgeCheck, ShieldAlert, ShieldCheck } from "lucide-react"
import { useMemo } from "react"
import { createColumnHelper, type DataTableColumnDef } from "@/packages/table"
import { Avatar, AvatarFallback } from "@/packages/ui/avatar"
import { Badge } from "@/packages/ui/badge"
import { Button } from "@/packages/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/packages/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/packages/ui/tooltip"
import { cn } from "@/packages/ui-utils"
import {
  formatTimestampToDateTime,
  formatTimestampToRelativeTime,
} from "@/packages/ui-utils/time-utils"
import type { Api } from "../api/user-management"

const helper = createColumnHelper<Api.User.ListUser>()

function getDisplayAccount(user: Api.User.ListUser) {
  return user.account || user.email || user.fullAccount || "-"
}

function DotStatus({ blocked }: { blocked: boolean }) {
  if (blocked) {
    return (
      <Badge
        variant="outline"
        className="border-error/20 bg-error/5 font-medium text-error hover:bg-error/10"
      >
        <span className="mr-1.5 size-1.5 rounded-full bg-error animate-pulse" />
        已锁定
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className="border-success/20 bg-success/5 font-medium text-success hover:bg-success/10"
    >
      <span className="mr-1.5 size-1.5 rounded-full bg-success" />
      正常
    </Badge>
  )
}

const AVATAR_GRADIENTS = [
  "bg-gradient-to-br from-orange-400 to-rose-500",
  "bg-gradient-to-br from-blue-400 to-indigo-500",
  "bg-gradient-to-br from-emerald-400 to-teal-500",
  "bg-gradient-to-br from-violet-400 to-purple-500",
  "bg-gradient-to-br from-amber-400 to-orange-500",
]

function getAvatarGradient(name: string) {
  const index = name.length % AVATAR_GRADIENTS.length
  return AVATAR_GRADIENTS[index]
}

interface UserManagementColumnActions {
  onEdit: (user: Api.User.ListUser) => void
  onSetPassword: (user: Api.User.ListUser) => void
  onShowUnmask: (user: Api.User.ListUser) => void
  onToggleBlock: (user: Api.User.ListUser) => void
  onChangeGroups: (user: Api.User.ListUser) => void
  onDelete: (user: Api.User.ListUser) => void
}

export function useUserManagementColumns(actions: UserManagementColumnActions) {
  return useMemo<DataTableColumnDef<Api.User.ListUser>[]>(
    () => [
      helper.accessor("name", {
        id: "userInfo",
        header: "用户信息",
        size: 280,
        meta: {
          align: "left",
          headerClassName: "pl-4",
          cellClassName: "pl-4",
        },
        cell: (info) => {
          const user = info.row.original
          const accountText = getDisplayAccount(user)
          const firstChar = user.name.trim().charAt(0).toUpperCase() || "U"
          const gradientClass = getAvatarGradient(user.name)

          return (
            <div className="flex items-center gap-3.5 py-1.5">
              <Avatar size="sm" className="rounded-lg shadow-sm">
                <AvatarFallback className={cn("text-white font-medium", gradientClass)}>
                  {firstChar}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[15px] font-bold text-foreground/90 leading-tight">
                    {user.name}
                  </span>
                  {user.realNameVerified ? (
                    <Tooltip>
                      <TooltipTrigger>
                        <BadgeCheck className="size-3.5 shrink-0 text-blue-500" />
                      </TooltipTrigger>
                      <TooltipContent>已实名认证</TooltipContent>
                    </Tooltip>
                  ) : null}
                </div>
                <div className="truncate text-xs font-mono text-muted-foreground/70 mt-0.5">
                  {accountText}
                </div>
              </div>
            </div>
          )
        },
      }),
      helper.display({
        id: "userGroups",
        header: "所属用户组",
        size: 230,
        meta: {
          align: "left",
        },
        cell: (info) => {
          const groups = info.row.original.userGroups
          if (!groups.length) {
            return <span className="text-xs text-muted-foreground">未分配</span>
          }
          const visible = groups.slice(0, 2)
          const overflow = groups.length - visible.length
          return (
            <div className="flex flex-wrap items-center gap-1.5 py-1">
              {visible.map((group) => (
                <Badge key={group.id} variant="secondary" className="font-normal">
                  {group.name}
                </Badge>
              ))}
              {overflow > 0 ? <Badge variant="outline">+{overflow}</Badge> : null}
            </div>
          )
        },
      }),
      helper.display({
        id: "security",
        header: "安全状态",
        size: 180,
        meta: {
          align: "center",
        },
        cell: (info) => {
          const user = info.row.original
          return (
            <div className="flex flex-col gap-2 py-1 items-center lg:items-start">
              <Badge
                variant="outline"
                className={cn(
                  "w-fit gap-1.5 px-2 py-0.5 font-medium border-transparent",
                  user.mfaEnabled
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {user.mfaEnabled ? (
                  <ShieldCheck className="size-3.5" />
                ) : (
                  <ShieldAlert className="size-3.5" />
                )}
                {user.mfaEnabled ? "MFA 保护中" : "MFA 未开启"}
              </Badge>
              <DotStatus blocked={user.blocked} />
            </div>
          )
        },
      }),
      helper.accessor("lastActiveTime", {
        id: "activity",
        header: "最后活动",
        size: 170,
        meta: {
          align: "center",
        },
        cell: (info) => {
          const value = info.getValue()
          if (!value) {
            return <span className="text-xs text-muted-foreground">-</span>
          }
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-default text-xs text-muted-foreground">
                  {formatTimestampToRelativeTime(value)}
                </span>
              </TooltipTrigger>
              <TooltipContent>{formatTimestampToDateTime(value)}</TooltipContent>
            </Tooltip>
          )
        },
      }),
      helper.display({
        id: "__actions__",
        header: "操作",
        size: 120,
        enableResizing: false,
        meta: {
          align: "center",
        },
        cell: (info) => {
          const user = info.row.original
          return (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs font-medium hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
                onClick={() => actions.onEdit(user)}
              >
                编辑
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    更多
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-40">
                  <DropdownMenuItem onClick={() => actions.onShowUnmask(user)}>
                    查看明文
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => actions.onToggleBlock(user)}>
                    {user.blocked ? "解锁" : "锁定"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => actions.onChangeGroups(user)}>
                    修改用户组
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => actions.onSetPassword(user)}>
                    修改密码
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => actions.onDelete(user)}>
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      }),
    ],
    [actions],
  )
}
