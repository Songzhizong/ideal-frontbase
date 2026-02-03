import { FolderOpen, LayoutGrid, Users } from "lucide-react"
import { PERMISSIONS } from "@/config/permissions"

export const PRIMARY_NAV = [
	{ title: "控制台", to: "/", icon: LayoutGrid, permission: PERMISSIONS.DASHBOARD_VIEW },
	{
		title: "文件管理",
		to: "/file-management",
		icon: FolderOpen,
		permission: PERMISSIONS.FILE_MANAGEMENT_VIEW,
	},
	{ title: "用户管理", to: "/users", icon: Users, permission: PERMISSIONS.USERS_READ },
] as const

export const SECONDARY_NAV = [] as const

export const ALL_NAV = [...PRIMARY_NAV, ...SECONDARY_NAV] as const

export type NavItem = (typeof ALL_NAV)[number]
