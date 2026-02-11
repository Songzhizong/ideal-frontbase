import { AlertTriangle, ShieldAlert } from "lucide-react"
import * as React from "react"
import { useInferaSidebarNav } from "@/components/sidebar"
import { TopbarStart } from "@/components/topbar"
import { NoAccess, UserMenu } from "@/features/core/auth"
import { NotificationsButton } from "@/features/core/notifications"
import { useAuthStore } from "@/packages/auth-core"
import { BaseLayout, findFirstAccessibleNav, type LayoutIcon } from "@/packages/layout-core"
import { ThemeSettingsDrawer } from "@/packages/theme-system"
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
  const { primaryNavGroups, allNavGroups, primaryNavItems } = useInferaSidebarNav()

  const hasAccessiblePrimaryNav = React.useMemo(() => {
    return findFirstAccessibleNav(primaryNavItems, hasPermission) !== null
  }, [hasPermission, primaryNavItems])

  const pageContent = hasAccessiblePrimaryNav ? children : <NoAccess />

  return (
    <BaseLayout
      primaryNavGroups={primaryNavGroups}
      allNavGroups={allNavGroups}
      permissionChecker={hasPermission}
      sidebarBrand={<SidebarBrand />}
      headerLeading={<TopbarStart />}
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
