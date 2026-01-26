import { Link, useRouterState } from "@tanstack/react-router"
import { ChevronRight, LayoutGrid, type LucideIcon } from "lucide-react"
import * as React from "react"
import { useUiStore } from "@/hooks/use-ui-store"

interface BreadcrumbsProps {
	navItems: readonly { title: string; to: string; icon: LucideIcon }[]
}

export function Breadcrumbs({ navItems }: BreadcrumbsProps) {
	const { showBreadcrumb, showBreadcrumbIcon } = useUiStore()
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	})

	const routeLabels = React.useMemo(() => {
		const entries: Array<[string, string]> = navItems.map((item) => [item.to, item.title])
		return new Map<string, string>(entries)
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
										const icon = navItems.find((n) => n.to === pathname)?.icon
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
