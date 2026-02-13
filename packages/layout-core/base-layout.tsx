import { useRouterState } from "@tanstack/react-router"
import * as React from "react"
import { useThemeStore } from "@/packages/theme-system"
import { SidebarProvider } from "@/packages/ui/sidebar"
import { cn } from "@/packages/ui-utils"
import { filterNavByPermission, flattenNavGroups } from "./nav-utils"
import { AppSidebar } from "./parts/app-sidebar"
import { Header } from "./parts/header"
import { SearchCommand } from "./parts/search-command"
import type { LayoutIcon, LayoutNavGroup, LayoutNavItem, LayoutPermissionChecker } from "./types"

interface BaseLayoutProps {
  children: React.ReactNode
  primaryNavItems?: readonly LayoutNavItem[]
  primaryNavGroups?: readonly LayoutNavGroup[]
  allNavItems?: readonly LayoutNavItem[]
  allNavGroups?: readonly LayoutNavGroup[]
  permissionChecker?: LayoutPermissionChecker
  sidebarBrand?: React.ReactNode
  headerActions?: React.ReactNode
  headerLeading?: React.ReactNode
  appTitle?: string
  breadcrumbIconByPath?: Readonly<Record<string, LayoutIcon>>
  searchPlaceholder?: string
}

export function BaseLayout({
  children,
  primaryNavItems,
  primaryNavGroups,
  allNavItems,
  allNavGroups,
  permissionChecker,
  sidebarBrand,
  headerActions,
  headerLeading,
  appTitle,
  breadcrumbIconByPath,
  searchPlaceholder,
}: BaseLayoutProps) {
  const sidebarWidth = useThemeStore((state) => state.layout.sidebarWidth)
  const sidebarCollapsedWidth = useThemeStore((state) => state.layout.sidebarCollapsedWidth)
  const containerWidth = useThemeStore((state) => state.layout.containerWidth)
  const pageAnimation = useThemeStore((state) => state.ui.pageAnimation)
  const sidebarAccordion = useThemeStore((state) => state.ui.sidebarAccordion)
  const menuLayout = useThemeStore((state) => state.layout.menuLayout)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const enableRouteRemount = pageAnimation !== "none"
  const [searchOpen, setSearchOpen] = React.useState(false)

  const primarySidebarGroups = React.useMemo(() => {
    if (primaryNavGroups) {
      return primaryNavGroups
    }

    return [
      {
        items: primaryNavItems ?? [],
      },
    ]
  }, [primaryNavGroups, primaryNavItems])

  const searchableNavSourceItems = React.useMemo(() => {
    if (allNavGroups) {
      return flattenNavGroups(allNavGroups)
    }

    if (allNavItems) {
      return allNavItems
    }

    return flattenNavGroups(primarySidebarGroups)
  }, [allNavGroups, allNavItems, primarySidebarGroups])

  const searchableNavItems = React.useMemo(() => {
    return filterNavByPermission(searchableNavSourceItems, permissionChecker)
  }, [permissionChecker, searchableNavSourceItems])

  const contentClassName = cn(
    "h-full w-full",
    containerWidth === "fixed" ? "mx-auto max-w-7xl" : null,
    pageAnimation !== "none" ? `animate-${pageAnimation}` : null,
  )

  const onSearchOpen = searchableNavItems.length > 0 ? () => setSearchOpen(true) : undefined
  const sidebarCollapsible: "none" | "icon" = menuLayout === "dual" ? "none" : "icon"

  const sidebarProps = {
    groups: primarySidebarGroups,
    ...(permissionChecker ? { permissionChecker } : {}),
    collapsible: sidebarCollapsible,
    showLabel: menuLayout === "single",
    ...(sidebarBrand ? { brand: sidebarBrand } : {}),
    ...(appTitle ? { appTitle } : {}),
  }

  const headerProps = {
    navItems: searchableNavItems,
    ...(onSearchOpen ? { onSearchOpen } : {}),
    ...(headerLeading ? { leading: headerLeading } : {}),
    ...(headerActions ? { actions: headerActions } : {}),
    ...(breadcrumbIconByPath ? { breadcrumbIconByPath } : {}),
  }

  const searchCommandProps = {
    items: searchableNavItems,
    open: searchOpen,
    onOpenChange: setSearchOpen,
    ...(searchPlaceholder ? { placeholder: searchPlaceholder } : {}),
  }

  return (
    <SidebarProvider
      menuAccordion={sidebarAccordion}
      className="bg-transparent"
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
          "--sidebar-width-icon": `${sidebarCollapsedWidth}px`,
        } as React.CSSProperties
      }
    >
      <AppSidebar {...sidebarProps} />

      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <Header {...headerProps} />

        <main className="relative flex-1 overflow-y-auto">
          {enableRouteRemount ? (
            <div key={pathname} className={contentClassName}>
              {children}
            </div>
          ) : (
            <div className={contentClassName}>{children}</div>
          )}
        </main>
      </div>

      <SearchCommand {...searchCommandProps} />
    </SidebarProvider>
  )
}
