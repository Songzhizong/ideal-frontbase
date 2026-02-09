import { Link, useMatches } from "@tanstack/react-router"
import { ChevronRight, LayoutGrid } from "lucide-react"
import * as React from "react"
import { useThemeStore } from "@/packages/theme-system"
import { flattenNavItems } from "../nav-utils"
import type { LayoutIcon, LayoutNavItem } from "../types"

interface BreadcrumbsProps {
  navItems: readonly LayoutNavItem[]
  iconByPath?: Readonly<Record<string, LayoutIcon>>
}

export function Breadcrumbs({ navItems, iconByPath }: BreadcrumbsProps) {
  const showBreadcrumb = useThemeStore((state) => state.ui.showBreadcrumb)
  const showBreadcrumbIcon = useThemeStore((state) => state.ui.showBreadcrumbIcon)
  const matches = useMatches()

  const routeIcons = React.useMemo(() => {
    const entries: Array<[string, LayoutIcon]> = []

    for (const item of flattenNavItems(navItems)) {
      if (item.icon) {
        entries.push([item.to, item.icon])
      }
    }

    if (iconByPath) {
      for (const [path, icon] of Object.entries(iconByPath)) {
        entries.push([path, icon])
      }
    }

    return new Map<string, LayoutIcon>(entries)
  }, [iconByPath, navItems])

  const breadcrumbs = React.useMemo(() => {
    return matches
      .filter((match) => {
        const title = (match.staticData as { title?: string })?.title
        return !!title
      })
      .map((match) => {
        const title = (match.staticData as { title?: string })?.title ?? ""

        return {
          label: title,
          to: match.pathname,
        }
      })
  }, [matches])

  if (!showBreadcrumb || breadcrumbs.length === 0) {
    return null
  }

  return (
    <nav
      className="hidden items-center text-sm text-muted-foreground md:flex"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center gap-2">
        {breadcrumbs.map((crumb, index) => (
          <li key={`${crumb.to}-${crumb.label}`} className="flex items-center gap-2">
            {index > 0 ? <ChevronRight className="size-3 text-muted-foreground/50" /> : null}
            {index < breadcrumbs.length - 1 ? (
              <Link
                to={crumb.to}
                className="flex items-center gap-1 transition hover:text-foreground"
              >
                {showBreadcrumbIcon && index === 0 ? <LayoutGrid className="size-3" /> : null}
                {crumb.label}
              </Link>
            ) : (
              <span className="flex items-center gap-1 font-semibold text-foreground">
                {showBreadcrumbIcon
                  ? (() => {
                      const icon = routeIcons.get(crumb.to) || (index === 0 ? LayoutGrid : null)
                      return icon ? React.createElement(icon, { className: "size-3" }) : null
                    })()
                  : null}
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
