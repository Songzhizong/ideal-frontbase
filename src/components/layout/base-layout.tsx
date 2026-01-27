import { useRouterState } from "@tanstack/react-router"
import { LayoutGrid, LineChart, Settings, Sparkles, Users } from "lucide-react"
import * as React from "react"
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarProvider,
} from "@/components/ui/sidebar"
import { useUiStore } from "@/hooks/use-ui-store"
import { cn } from "@/lib/utils"
import { Header } from "./parts/header"
import { SearchCommand } from "./parts/search-command"
import { SidebarBrand } from "./parts/sidebar-brand"
import { SidebarNavItem } from "./parts/sidebar-nav-item"

const PRIMARY_NAV = [
	{ title: "Overview", to: "/", icon: LayoutGrid },
	{ title: "Automation", to: "/automation", icon: Sparkles },
	{ title: "Insights", to: "/analytics", icon: LineChart },
	{ title: "Team", to: "/team", icon: Users },
	{ title: "Settings", to: "/settings", icon: Settings },
] as const

const SECONDARY_NAV = [{ title: "Settings", to: "/settings", icon: Settings }] as const

const ALL_NAV = [...PRIMARY_NAV, ...SECONDARY_NAV] as const

export function BaseLayout({ children }: { children: React.ReactNode }) {
	const { sidebarWidth, sidebarCollapsedWidth, containerWidth, pageAnimation, menuLayout } =
		useUiStore()

	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	})
	const [searchOpen, setSearchOpen] = React.useState(false)
	const [animationKey, setAnimationKey] = React.useState(0)

	// Trigger animation on route change
	React.useEffect(() => {
		if (pageAnimation !== "none") {
			setAnimationKey((prev) => prev + 1)
		}
	}, [pathname, pageAnimation])

	return (
		<SidebarProvider
			className="bg-transparent "
			sidebarWidth={sidebarWidth}
			sidebarCollapsedWidth={sidebarCollapsedWidth}
		>
			<Sidebar
				collapsible={menuLayout === "dual" ? "none" : "icon"}
				className={cn(
					"sticky top-0 h-screen transition-all duration-300 px-1",
					"bg-sidebar border-sidebar-border text-sidebar-foreground",
				)}
			>
				<SidebarHeader>
					<SidebarBrand />
				</SidebarHeader>
				<SidebarContent className="space-y-6">
					<SidebarGroup>
						<SidebarGroupContent>
							<SidebarMenu>
								{PRIMARY_NAV.map((item) => (
									<SidebarNavItem
										key={item.title}
										item={item}
										isActive={pathname === item.to}
										showLabel={menuLayout === "single"}
									/>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
			</Sidebar>

			<div className="flex min-h-screen flex-1 flex-col">
				<Header navItems={ALL_NAV} onSearchOpen={() => setSearchOpen(true)} />

				<main className="flex-1 overflow-hidden relative">
					<div
						key={animationKey}
						className={cn(
							"h-full w-full",
							containerWidth === "fixed" ? "mx-auto max-w-7xl" : "",
							pageAnimation !== "none" && `animate-${pageAnimation}`,
						)}
					>
						{children}
					</div>
				</main>
			</div>
			<SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
		</SidebarProvider>
	)
}
