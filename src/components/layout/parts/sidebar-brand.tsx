import * as React from "react"
import AppLogo from "@/assets/logo.svg"
import { useSidebar } from "@/components/ui/sidebar"
import { useUiStore } from "@/hooks/use-ui-store"
import { cn } from "@/lib/utils"

export function SidebarBrand() {
	const { state, isMobile } = useSidebar()
	const { menuLayout, theme } = useUiStore()
	const collapsed = (state === "collapsed" && !isMobile) || menuLayout === "dual"
	const appTitle = import.meta.env.VITE_APP_TITLE ?? "App"

	const [isSidebarDark, setIsSidebarDark] = React.useState(false)

	React.useEffect(() => {
		const checkDark = () => {
			if (typeof window === "undefined") return false
			const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
			return theme === "dark" || (theme === "system" && isSystemDark)
		}
		setIsSidebarDark(checkDark())

		if (theme === "system") {
			const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
			const handler = () => setIsSidebarDark(checkDark())
			mediaQuery.addEventListener("change", handler)
			return () => mediaQuery.removeEventListener("change", handler)
		}
	}, [theme])

	return (
		<div className={cn("flex items-center gap-3 px-2", collapsed && "justify-center px-0")}>
			<img
				src={AppLogo}
				alt={`${appTitle} logo`}
				className={cn(
					"h-8 w-auto",
					collapsed && "h-7",
					isSidebarDark && "brightness-200 contrast-150 invert",
				)}
			/>
			{!collapsed && (
				<span
					className={cn(
						"text-lg font-semibold uppercase tracking-[0.2em]",
						isSidebarDark ? "text-sidebar-foreground" : "text-foreground",
					)}
				>
					{appTitle}
				</span>
			)}
		</div>
	)
}
