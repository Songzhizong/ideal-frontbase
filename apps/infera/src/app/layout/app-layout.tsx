import { AlertTriangle, ShieldAlert } from "lucide-react"
import * as React from "react"
import { NoAccess, UserMenu } from "@/features/core/auth"
import { NotificationsButton } from "@/features/core/notifications"
import { useAuthStore } from "@/packages/auth-core"
import { BaseLayout, findFirstAccessibleNav, type LayoutIcon } from "@/packages/layout-core"
import { ThemeSettingsDrawer } from "@/packages/theme-system"
import { ALL_NAV, PRIMARY_NAV } from "./nav-config"
import { SidebarBrand } from "./parts/sidebar-brand"

const BREADCRUMB_ICON_BY_PATH: Readonly<Record<string, LayoutIcon>> = {
  "/errors/403": ShieldAlert,
  "/errors/404": AlertTriangle,
  "/errors/500": AlertTriangle,
}

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const hasPermission = useAuthStore((state) => state.hasPermission)

  const hasAccessiblePrimaryNav = React.useMemo(() => {
    return findFirstAccessibleNav(PRIMARY_NAV, hasPermission) !== null
  }, [hasPermission])

  const pageContent = hasAccessiblePrimaryNav ? children : <NoAccess />

  return (
    <BaseLayout
      primaryNavItems={PRIMARY_NAV}
      allNavItems={ALL_NAV}
      permissionChecker={hasPermission}
      sidebarBrand={<SidebarBrand />}
      headerActions={
        <>
          <ThemeSettingsDrawer />
          <NotificationsButton />
          <UserMenu />
        </>
      }
      appTitle={import.meta.env.VITE_APP_TITLE ?? "App"}
      breadcrumbIconByPath={BREADCRUMB_ICON_BY_PATH}
    >
      {pageContent}
    </BaseLayout>
  )
}
