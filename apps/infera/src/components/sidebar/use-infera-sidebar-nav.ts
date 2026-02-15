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
import { COMPONENT_DEMOS } from "@/features/component-showcase/component-demo-config"
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

interface NavCategoryTemplate {
  title: string
  icon: LayoutIcon
  pathSuffix: string
  children: readonly NavTemplate[]
}

interface SidebarNavState {
  scope: WorkspaceScope
  primaryNavGroups: readonly LayoutNavGroup[]
  allNavGroups: readonly LayoutNavGroup[]
  primaryNavItems: readonly LayoutNavItem[]
}

const COMPONENT_SHOWCASE_DEFAULT_PATH_SUFFIX = `/components/${COMPONENT_DEMOS[0]?.slug ?? "copy"}`

const TENANT_NAV_TEMPLATES: readonly NavCategoryTemplate[] = [
  {
    title: "工作台",
    icon: LayoutGrid,
    pathSuffix: "/overview",
    children: [
      {
        title: "概览",
        icon: LayoutGrid,
        pathSuffix: "/overview",
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
      {
        title: "项目管理",
        icon: FolderKanban,
        pathSuffix: "/projects",
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
    ],
  },
  {
    title: "组件示例",
    icon: Boxes,
    pathSuffix: COMPONENT_SHOWCASE_DEFAULT_PATH_SUFFIX,
    children: COMPONENT_DEMOS.map((demo) => ({
      title: demo.menuTitle,
      icon: Boxes,
      pathSuffix: `/components/${demo.slug}`,
      permission: PERMISSIONS.DASHBOARD_VIEW,
    })),
  },
  {
    title: "组织与安全",
    icon: Users,
    pathSuffix: "/users",
    children: [
      {
        title: "用户管理",
        icon: Users,
        pathSuffix: "/users",
        permission: PERMISSIONS.USERS_READ,
      },
      {
        title: "审计日志",
        icon: FileText,
        pathSuffix: "/audit",
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
    ],
  },
  {
    title: "成本与告警",
    icon: CreditCard,
    pathSuffix: "/billing",
    children: [
      {
        title: "账单中心",
        icon: CreditCard,
        pathSuffix: "/billing",
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
      {
        title: "配额与预算",
        icon: Gauge,
        pathSuffix: "/quotas-budgets",
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
      {
        title: "告警中心",
        icon: BellRing,
        pathSuffix: "/alerts",
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
    ],
  },
]

const PROJECT_NAV_TEMPLATES: readonly NavCategoryTemplate[] = [
  {
    title: "项目总览",
    icon: LayoutGrid,
    pathSuffix: "/dashboard",
    children: [
      {
        title: "仪表盘",
        icon: LayoutGrid,
        pathSuffix: "/dashboard",
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
    ],
  },
  {
    title: "模型与数据",
    icon: Boxes,
    pathSuffix: "/models",
    children: [
      {
        title: "模型库",
        icon: Boxes,
        pathSuffix: "/models",
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
      {
        title: "数据集",
        icon: Database,
        pathSuffix: "/datasets",
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
    ],
  },
  {
    title: "训练与评测",
    icon: WandSparkles,
    pathSuffix: "/fine-tuning",
    children: [
      {
        title: "微调任务",
        icon: WandSparkles,
        pathSuffix: "/fine-tuning",
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
      {
        title: "评测中心",
        icon: FlaskConical,
        pathSuffix: "/evaluation",
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
    ],
  },
  {
    title: "服务与访问",
    icon: Server,
    pathSuffix: "/services",
    children: [
      {
        title: "服务管理",
        icon: Server,
        pathSuffix: "/services",
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
      {
        title: "API 密钥",
        icon: KeyRound,
        pathSuffix: "/api-keys",
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
    ],
  },
  {
    title: "运维与治理",
    icon: ChartColumnIncreasing,
    pathSuffix: "/usage",
    children: [
      {
        title: "用量分析",
        icon: ChartColumnIncreasing,
        pathSuffix: "/usage",
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
      {
        title: "项目设置",
        icon: Settings,
        pathSuffix: "/settings",
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
      {
        title: "审计日志",
        icon: FileText,
        pathSuffix: "/audit",
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
    ],
  },
]

function buildNavItems(
  templates: readonly NavCategoryTemplate[],
  toPath: (pathSuffix: string) => string,
) {
  return templates.map((template) => ({
    title: template.title,
    to: toPath(template.pathSuffix),
    icon: template.icon,
    children: template.children.map((child) => ({
      title: child.title,
      to: toPath(child.pathSuffix),
      icon: child.icon,
      ...(child.permission ? { permission: child.permission } : {}),
    })),
  }))
}

function buildTenantNavItems(tenantId: string) {
  return buildNavItems(TENANT_NAV_TEMPLATES, (pathSuffix) => buildTenantPath(tenantId, pathSuffix))
}

function buildProjectNavItems(tenantId: string, projectId: string) {
  return buildNavItems(PROJECT_NAV_TEMPLATES, (pathSuffix) =>
    buildProjectPath(tenantId, projectId, pathSuffix),
  )
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
        title: "租户空间",
        items: tenantNavItems,
      },
      {
        title: "项目空间",
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
