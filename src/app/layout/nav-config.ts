import { FolderOpen, LayoutGrid, Table, Users } from "lucide-react"
import { PERMISSIONS } from "@/config/permissions"
import type { LayoutNavItem } from "@/packages/layout-core"

export const PRIMARY_NAV: readonly LayoutNavItem[] = [
  { title: "控制台", to: "/", icon: LayoutGrid, permission: PERMISSIONS.DASHBOARD_VIEW },
  {
    title: "文件管理",
    to: "/file-management",
    icon: FolderOpen,
    permission: PERMISSIONS.FILE_MANAGEMENT_VIEW,
  },
  {
    title: "示例",
    to: "/example",
    icon: Table,
    children: [
      {
        title: "用户管理",
        to: "/example/users",
        icon: Users,
      },
    ],
  },
]

export const SECONDARY_NAV: readonly LayoutNavItem[] = []

export const ALL_NAV: readonly LayoutNavItem[] = [...PRIMARY_NAV, ...SECONDARY_NAV]
