import { FolderOpen, LayoutGrid, Table, Users } from "lucide-react"
import { PERMISSIONS } from "@/config/permissions"
import type { LayoutNavGroup, LayoutNavItem } from "@/packages/layout-core"

export const PRIMARY_NAV_GROUPS: readonly LayoutNavGroup[] = [
  {
    title: "概览",
    items: [
      { title: "控制台", to: "/", icon: LayoutGrid, permission: PERMISSIONS.DASHBOARD_VIEW },
      {
        title: "文件管理",
        to: "/file-management",
        icon: FolderOpen,
        permission: PERMISSIONS.FILE_MANAGEMENT_VIEW,
      },
    ],
  },
  {
    title: "示例",
    items: [
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
    ],
  },
]

export const SECONDARY_NAV_GROUPS: readonly LayoutNavGroup[] = []

export const PRIMARY_NAV: readonly LayoutNavItem[] = PRIMARY_NAV_GROUPS.flatMap(
  (group) => group.items,
)
export const SECONDARY_NAV: readonly LayoutNavItem[] = SECONDARY_NAV_GROUPS.flatMap(
  (group) => group.items,
)
export const ALL_NAV_GROUPS: readonly LayoutNavGroup[] = [
  ...PRIMARY_NAV_GROUPS,
  ...SECONDARY_NAV_GROUPS,
]
export const ALL_NAV: readonly LayoutNavItem[] = [...PRIMARY_NAV, ...SECONDARY_NAV]
