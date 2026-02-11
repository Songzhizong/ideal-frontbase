import { useRouterState } from "@tanstack/react-router"
import {
  BellRing,
  Boxes,
  ChartColumnIncreasing,
  CreditCard,
  Database,
  FileText,
  FlaskConical,
  FolderKanban,
  Gauge,
  KeyRound,
  LayoutGrid,
  Server,
  Settings,
  Users,
  WandSparkles,
} from "lucide-react"
import * as React from "react"
import {
  buildProjectPath,
  buildTenantPath,
  parseWorkspacePath,
  type WorkspaceScope,
} from "@/components/workspace/workspace-context"
import { PERMISSIONS } from "@/config/permissions"
import { resolveDefaultTenantId } from "@/features/core/auth/utils/resolve-default-tenant-id"
import type { Permission } from "@/packages/auth-core"
import { useAuthStore } from "@/packages/auth-core"
import type { LayoutIcon, LayoutNavGroup, LayoutNavItem } from "@/packages/layout-core"

interface NavTemplate {
  title: string
  icon: LayoutIcon
  pathSuffix: string
  permission?: Permission
}

interface SidebarNavState {
  scope: WorkspaceScope
  primaryNavGroups: readonly LayoutNavGroup[]
  allNavGroups: readonly LayoutNavGroup[]
  primaryNavItems: readonly LayoutNavItem[]
}

const TENANT_NAV_TEMPLATES: readonly NavTemplate[] = [
  {
    title: "Overview",
    icon: LayoutGrid,
    pathSuffix: "/overview",
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    title: "Projects",
    icon: FolderKanban,
    pathSuffix: "/projects",
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    title: "Users",
    icon: Users,
    pathSuffix: "/users",
    permission: PERMISSIONS.USERS_READ,
  },
  {
    title: "Billing",
    icon: CreditCard,
    pathSuffix: "/billing",
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    title: "Quotas",
    icon: Gauge,
    pathSuffix: "/quotas-budgets",
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    title: "Alerts",
    icon: BellRing,
    pathSuffix: "/alerts",
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    title: "Audit",
    icon: FileText,
    pathSuffix: "/audit",
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
]

const PROJECT_NAV_TEMPLATES: readonly NavTemplate[] = [
  {
    title: "Dashboard",
    icon: LayoutGrid,
    pathSuffix: "/dashboard",
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    title: "Models",
    icon: Boxes,
    pathSuffix: "/models",
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    title: "Datasets",
    icon: Database,
    pathSuffix: "/datasets",
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    title: "Fine-tuning",
    icon: WandSparkles,
    pathSuffix: "/fine-tuning",
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    title: "Evaluation",
    icon: FlaskConical,
    pathSuffix: "/evaluation",
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    title: "Services",
    icon: Server,
    pathSuffix: "/services",
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    title: "API Keys",
    icon: KeyRound,
    pathSuffix: "/api-keys",
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    title: "Usage",
    icon: ChartColumnIncreasing,
    pathSuffix: "/usage",
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    title: "Settings",
    icon: Settings,
    pathSuffix: "/settings",
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    title: "Audit",
    icon: FileText,
    pathSuffix: "/audit",
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
]

function buildTenantNavItems(tenantId: string) {
  return TENANT_NAV_TEMPLATES.map((template) => ({
    title: template.title,
    to: buildTenantPath(tenantId, template.pathSuffix),
    icon: template.icon,
    ...(template.permission ? { permission: template.permission } : {}),
  }))
}

function buildProjectNavItems(tenantId: string, projectId: string) {
  return PROJECT_NAV_TEMPLATES.map((template) => ({
    title: template.title,
    to: buildProjectPath(tenantId, projectId, template.pathSuffix),
    icon: template.icon,
    ...(template.permission ? { permission: template.permission } : {}),
  }))
}

export function useInferaSidebarNav(): SidebarNavState {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const user = useAuthStore((state) => state.user)
  const tenantId = useAuthStore((state) => state.tenantId)

  const workspacePath = React.useMemo(() => {
    return parseWorkspacePath(pathname)
  }, [pathname])

  const activeTenantId = React.useMemo(() => {
    return resolveDefaultTenantId({
      tenantId,
      user,
    })
  }, [tenantId, user])

  const projectId = workspacePath.projectId ?? `${activeTenantId}-default`

  const tenantNavItems = React.useMemo(() => {
    return buildTenantNavItems(activeTenantId)
  }, [activeTenantId])

  const projectNavItems = React.useMemo(() => {
    return buildProjectNavItems(activeTenantId, projectId)
  }, [activeTenantId, projectId])

  const primaryNavGroups = React.useMemo(() => {
    return [
      {
        items: tenantNavItems,
      },
      {
        title: "项目控制台",
        items: projectNavItems,
      },
    ] satisfies readonly LayoutNavGroup[]
  }, [projectNavItems, tenantNavItems])

  const allNavGroups = primaryNavGroups

  const primaryNavItems = React.useMemo(() => {
    return primaryNavGroups.flatMap((group) => group.items)
  }, [primaryNavGroups])

  return {
    scope: workspacePath.scope,
    primaryNavGroups,
    allNavGroups,
    primaryNavItems,
  }
}
