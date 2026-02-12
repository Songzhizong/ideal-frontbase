import { createFileRoute, redirect } from "@tanstack/react-router"
import { PRIMARY_NAV } from "@/app/layout/nav-config"
import { PERMISSIONS } from "@/config/permissions"
import { InfrastructureDashboard } from "@/features/dashboard/routes/infrastructure-dashboard"
import { authStore } from "@/packages/auth-core"
import { findFirstAccessibleNav } from "@/packages/layout-core"

export const Route = createFileRoute("/_authenticated/_dashboard/")({
  beforeLoad: () => {
    const { hasPermission } = authStore.getState()

    // 检查是否有控制台访问权限
    if (!hasPermission(PERMISSIONS.DASHBOARD_VIEW)) {
      const firstAccessiblePage = findFirstAccessibleNav(PRIMARY_NAV, hasPermission)

      // 如果有其他可访问的页面,重定向到该页面
      if (firstAccessiblePage && firstAccessiblePage.to !== "/") {
        throw redirect({
          to: firstAccessiblePage.to,
        })
      }

      // 如果没有任何可访问的页面,会由 AppLayout 注入 NoAccess 组件
    }
  },
  component: InfrastructureDashboard,
  staticData: {
    title: "控制台",
  },
})
