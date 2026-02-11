import { AlertCircle, BadgeCheck, MoreHorizontal, ShieldAlert, ShieldCheck } from "lucide-react"
import { useMemo } from "react"
import {
  createColumnHelper,
  type DataTableColumnDef,
  DataTableIndicatorList,
  DataTableStatusPill,
  DataTableTagListCell,
  type DataTableTagTone,
  DataTableTextPairCell,
  DataTableTimeMetaCell,
  DataTableUserIdentityCell,
} from "@/packages/table"
import { Button } from "@/packages/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/packages/ui/dropdown-menu"
import { formatTimestampToDate, formatTimestampToDateTime } from "@/packages/ui-utils/time-utils"
import type { Api } from "../api/user-management"

const helper = createColumnHelper<Api.User.ListUser>()

function getDisplayAccount(user: Api.User.ListUser) {
  return user.account || user.email || user.fullAccount || "-"
}

function maskEmail(email?: string) {
  if (!email) return "未绑定邮箱"
  const [local, domain] = email.split("@")
  if (!local || !domain || local.length <= 2) return email
  const visible = local.slice(0, Math.min(3, local.length))
  return `${visible}***@${domain}`
}

function maskPhone(phone?: string) {
  if (!phone) return "未绑定手机"
  const digits = phone.replace(/\s+/g, "")
  if (digits.length < 7) return phone
  return `${digits.slice(0, 3)}****${digits.slice(-4)}`
}

interface UserManagementColumnActions {
  onEdit: (user: Api.User.ListUser) => void
  onSetPassword: (user: Api.User.ListUser) => void
  onShowUnmask: (user: Api.User.ListUser) => void
  onToggleBlock: (user: Api.User.ListUser) => void
  onChangeGroups: (user: Api.User.ListUser) => void
  onDelete: (user: Api.User.ListUser) => void
}

// noinspection NonAsciiCharacters
const USER_GROUP_TONE_BY_LABEL: Readonly<Record<string, DataTableTagTone>> = {
  管理员: "error",
  Admin: "error",
  admin: "error",
}

export function useUserManagementColumns(actions: UserManagementColumnActions) {
  return useMemo<DataTableColumnDef<Api.User.ListUser>[]>(
    () => [
      helper.accessor("name", {
        id: "userInfo",
        header: "用户信息",
        size: 190,
        meta: {
          align: "left",
          headerClassName: "pl-4",
          cellClassName: "pl-4",
        },
        cell: (info) => {
          const user = info.row.original
          return (
            <DataTableUserIdentityCell
              name={user.name}
              subtext={getDisplayAccount(user)}
              verified={user.realNameVerified}
              subtextClassName="font-mono"
            />
          )
        },
      }),
      helper.display({
        id: "contact",
        header: "联系方式",
        size: 170,
        meta: {
          align: "left",
        },
        cell: (info) => {
          const user = info.row.original
          return (
            <DataTableTextPairCell
              primary={maskEmail(user.email)}
              secondary={maskPhone(user.phone)}
              secondaryClassName="font-mono"
            />
          )
        },
      }),
      helper.display({
        id: "userGroups",
        header: "所属用户组",
        size: 160,
        meta: {
          align: "left",
        },
        cell: (info) => (
          <DataTableTagListCell
            tags={info.row.original.userGroups.map((group) => group.name)}
            toneByLabel={USER_GROUP_TONE_BY_LABEL}
            randomTone
            randomToneSeed="tenant-user-groups"
          />
        ),
      }),
      helper.display({
        id: "securityAuth",
        header: "安全与认证",
        size: 170,
        meta: {
          align: "left",
        },
        cell: (info) => {
          const user = info.row.original
          return (
            <DataTableIndicatorList
              items={[
                {
                  key: "real-name",
                  icon: user.realNameVerified ? (
                    <BadgeCheck className="size-4" />
                  ) : (
                    <AlertCircle className="size-4" />
                  ),
                  label: user.realNameVerified ? "实名已认证" : "未实名",
                  tone: user.realNameVerified ? "success" : "muted",
                },
                {
                  key: "mfa",
                  icon: user.mfaEnabled ? (
                    <ShieldCheck className="size-4" />
                  ) : (
                    <ShieldAlert className="size-4" />
                  ),
                  label: user.mfaEnabled ? "MFA 已开启" : "MFA 未开启",
                  tone: user.mfaEnabled ? "primary" : "muted",
                },
              ]}
            />
          )
        },
      }),
      helper.accessor("blocked", {
        id: "status",
        header: "状态",
        size: 100,
        meta: {
          align: "left",
        },
        cell: (info) => {
          const blocked = info.getValue()
          return (
            <DataTableStatusPill
              tone={blocked ? "error" : "success"}
              label={blocked ? "已锁定" : "正常"}
            />
          )
        },
      }),
      helper.accessor("lastActiveTime", {
        id: "activity",
        header: "最后活动",
        size: 160,
        meta: {
          align: "left",
        },
        cell: (info) => {
          const user = info.row.original
          const lastActiveTime = info.getValue()
          return (
            <DataTableTimeMetaCell
              primary={lastActiveTime ? formatTimestampToDateTime(lastActiveTime) : "-"}
              secondary={`创建于 ${formatTimestampToDate(user.createdTime)}`}
            />
          )
        },
      }),
      helper.display({
        id: "__actions__",
        header: "操作",
        size: 64,
        enableResizing: false,
        meta: {
          align: "center",
        },
        cell: (info) => {
          const user = info.row.original
          return (
            <div className="flex justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="h-8 w-8">
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">操作菜单</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-40">
                  <DropdownMenuItem onClick={() => actions.onEdit(user)}>编辑</DropdownMenuItem>
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
