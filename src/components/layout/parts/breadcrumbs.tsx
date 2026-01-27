import { Link, useRouterState } from "@tanstack/react-router"
import {
	AlertTriangle,
	ChevronRight,
	LayoutGrid,
	ShieldAlert,
	type LucideIcon,
} from "lucide-react"
import * as React from "react"
import { useUiStore } from "@/hooks/use-ui-store"

interface BreadcrumbsProps {
	navItems: readonly { title: string; to: string; icon: LucideIcon }[]
}

// Error page configurations
const ERROR_PAGES = [
	{ to: "/errors/403", title: "Forbidden", icon: ShieldAlert },
	{ to: "/errors/404", title: "Not Found", icon: AlertTriangle },
	{ to: "/errors/500", title: "Server Error", icon: AlertTriangle },
] as const

export function Breadcrumbs({ navItems }: BreadcrumbsProps) {
	const { showBreadcrumb, showBreadcrumbIcon } = useUiStore()
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	})

	const routeLabels = React.useMemo(() => {
		const entries: Array<[string, string]> = navItems.map((item) => [item.to, item.title])
		// Add error page labels
		for (const errorPage of ERROR_PAGES) {
			entries.push([errorPage.to, errorPage.title])
		}
		return new Map<string, string>(entries)
	}, [navItems])

	const routeIcons = React.useMemo(() => {
		const entries: Array<[string, LucideIcon]> = navItems.map((item) => [item.to, item.icon])
		// Add error page icons
		for (const errorPage of ERROR_PAGES) {
			entries.push([errorPage.to, errorPage.icon])
		}
		return new Map<string, LucideIcon>(entries)
	}, [navItems])

	const breadcrumbLabel = routeLabels.get(pathname) ?? "Overview"

	const breadcrumbs = [
		{ label: "Signal", to: "/" },
		{ label: breadcrumbLabel, to: pathname },
	]

	if (!showBreadcrumb) return null

	return (
		<nav
			className="hidden items-center text-sm text-muted-foreground md:flex"
			aria-label="Breadcrumb"
		>
			<ol className="flex items-center gap-2">
				{breadcrumbs.map((crumb, index) => (
					<li key={crumb.label} className="flex items-center gap-2">
						{index > 0 ? <ChevronRight className="size-3 text-muted-foreground/50" /> : null}
						{index < breadcrumbs.length - 1 ? (
							<Link
								to={crumb.to}
								className="flex items-center gap-1 transition hover:text-foreground"
							>
								{showBreadcrumbIcon && index === 0 && <LayoutGrid className="size-3" />}
								{crumb.label}
							</Link>
						) : (
							<span className="flex items-center gap-1 font-semibold text-foreground">
								{showBreadcrumbIcon &&
									crumb.to === pathname &&
									(() => {
										const icon = routeIcons.get(pathname)
										return icon ? React.createElement(icon, { className: "size-3" }) : null
									})()}
								{crumb.label}
							</span>
						)}
					</li>
				))}
			</ol>
		</nav>
	)
}
