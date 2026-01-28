import { LayoutGrid } from "lucide-react"

export const PRIMARY_NAV = [{ title: "控制台", to: "/", icon: LayoutGrid }] as const

export const SECONDARY_NAV = [] as const

export const ALL_NAV = [...PRIMARY_NAV, ...SECONDARY_NAV] as const

export type NavItem = (typeof ALL_NAV)[number]
