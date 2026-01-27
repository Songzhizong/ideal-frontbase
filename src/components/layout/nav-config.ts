import { LayoutGrid, LineChart, Settings, Sparkles, Users } from "lucide-react"

export const PRIMARY_NAV = [
	{ title: "Overview", to: "/", icon: LayoutGrid },
	{ title: "Automation", to: "/automation", icon: Sparkles },
	{ title: "Insights", to: "/analytics", icon: LineChart },
	{ title: "Team", to: "/team", icon: Users },
	{ title: "Settings", to: "/settings", icon: Settings },
] as const

export const SECONDARY_NAV = [] as const

export const ALL_NAV = [...PRIMARY_NAV, ...SECONDARY_NAV] as const

export type NavItem = (typeof ALL_NAV)[number]
