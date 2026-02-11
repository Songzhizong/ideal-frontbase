import { LayoutGrid } from "lucide-react"
import { PERMISSIONS } from "@/config/permissions"
import type { LayoutNavItem } from "@/packages/layout-core"

export const PRIMARY_NAV: readonly LayoutNavItem[] = [
  { title: "控制台", to: "/", icon: LayoutGrid, permission: PERMISSIONS.DASHBOARD_VIEW },
]

export const SECONDARY_NAV: readonly LayoutNavItem[] = []

export const ALL_NAV: readonly LayoutNavItem[] = [...PRIMARY_NAV, ...SECONDARY_NAV]
