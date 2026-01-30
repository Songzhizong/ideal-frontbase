import { Link } from "@tanstack/react-router"
import type { LucideIcon } from "lucide-react"
import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"

export interface NavItem {
	title: string
	to: string
	icon: LucideIcon
	permission?: string
}

export function SidebarNavItem({
	item,
	isActive,
	showLabel = true,
}: {
	item: NavItem
	isActive: boolean
	showLabel?: boolean
}) {
	const { state, isMobile } = useSidebar()
	const collapsed = (state === "collapsed" && !isMobile) || !showLabel
	const Icon = item.icon

	return (
		<SidebarMenuItem>
			<SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
				<Link to={item.to}>
					<Icon className="size-4 shrink-0" />
					{!collapsed && <span>{item.title}</span>}
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	)
}
