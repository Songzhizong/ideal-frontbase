import type { TenantInfo, UserProfile } from "@/packages/auth-core"

export type WorkspaceScope = "tenant" | "project" | "other"
export type WorkspaceProjectEnvironment = "Dev" | "Test" | "Prod"

export interface WorkspaceProject {
  id: string
  name: string
  environment: WorkspaceProjectEnvironment
  lastVisitedAt: string
  serviceCount: number
}

export interface WorkspaceTenant {
  id: string
  name: string
  abbreviation: string
  projects: readonly WorkspaceProject[]
}

interface WorkspacePathMatch {
  scope: WorkspaceScope
  tenantId: string | null
  projectId: string | null
  tenantSuffix: string
  projectSuffix: string
}

interface WorkspaceSelection {
  scope: WorkspaceScope
  tenant: WorkspaceTenant
  project: WorkspaceProject | null
}

const PROJECT_PATH_PATTERN = /^\/t\/([^/]+)\/p\/([^/]+)(\/.*)?$/
const TENANT_PATH_PATTERN = /^\/t\/([^/]+)(\/.*)?$/

const DEFAULT_TENANTS = [
  {
    id: "1",
    name: "Acme AI",
    abbreviation: "ACME",
    projects: [
      {
        id: "project-chat",
        name: "Chat Gateway",
        environment: "Prod",
        lastVisitedAt: "2026-02-10T08:20:00Z",
        serviceCount: 6,
      },
      {
        id: "project-rag",
        name: "RAG Platform",
        environment: "Test",
        lastVisitedAt: "2026-02-09T13:15:00Z",
        serviceCount: 3,
      },
    ],
  },
  {
    id: "2",
    name: "Nebula Labs",
    abbreviation: "NBL",
    projects: [
      {
        id: "project-vision",
        name: "Vision Stack",
        environment: "Dev",
        lastVisitedAt: "2026-02-08T15:40:00Z",
        serviceCount: 2,
      },
      {
        id: "project-eval",
        name: "Evaluation Hub",
        environment: "Prod",
        lastVisitedAt: "2026-02-10T03:55:00Z",
        serviceCount: 4,
      },
    ],
  },
] satisfies readonly [WorkspaceTenant, ...WorkspaceTenant[]]

const FALLBACK_TENANT: WorkspaceTenant = DEFAULT_TENANTS[0]

const ENV_CYCLE: readonly WorkspaceProjectEnvironment[] = ["Dev", "Test", "Prod"]

function decodePathSegment(segment: string) {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

function encodePathSegment(segment: string) {
  return encodeURIComponent(segment)
}

function normalizeSuffix(input: string, fallback: string) {
  if (!input) {
    return fallback
  }
  return input.startsWith("/") ? input : `/${input}`
}

function findTenantById(tenants: readonly WorkspaceTenant[], tenantId: string | null) {
  if (!tenantId) {
    return null
  }

  return tenants.find((tenant) => tenant.id === tenantId) ?? null
}

function findProjectById(tenant: WorkspaceTenant, projectId: string | null) {
  if (!projectId) {
    return null
  }

  return tenant.projects.find((project) => project.id === projectId) ?? null
}

function getFallbackProjectsFromTenant(
  tenant: TenantInfo,
  index: number,
): readonly WorkspaceProject[] {
  const env = ENV_CYCLE[index % ENV_CYCLE.length] ?? "Dev"

  return [
    {
      id: `${tenant.id}-default`,
      name: `${tenant.name} 主项目`,
      environment: env,
      lastVisitedAt: "2026-02-10T00:00:00Z",
      serviceCount: 0,
    },
  ]
}

export function getWorkspaceTenants(user: UserProfile | null) {
  if (!user?.accessibleTenants.length) {
    return DEFAULT_TENANTS
  }

  return user.accessibleTenants.map((tenant, index) => {
    const matchedTenant = findTenantById(DEFAULT_TENANTS, tenant.id)

    return {
      id: tenant.id,
      name: tenant.name,
      abbreviation: tenant.abbreviation,
      projects: matchedTenant?.projects ?? getFallbackProjectsFromTenant(tenant, index),
    }
  })
}

export function parseWorkspacePath(pathname: string): WorkspacePathMatch {
  const projectMatch = pathname.match(PROJECT_PATH_PATTERN)

  if (projectMatch) {
    const tenantId = decodePathSegment(projectMatch[1] ?? "")
    const projectId = decodePathSegment(projectMatch[2] ?? "")

    return {
      scope: "project",
      tenantId,
      projectId,
      tenantSuffix: "/overview",
      projectSuffix: normalizeSuffix(projectMatch[3] ?? "", "/dashboard"),
    }
  }

  const tenantMatch = pathname.match(TENANT_PATH_PATTERN)
  if (tenantMatch) {
    const tenantId = decodePathSegment(tenantMatch[1] ?? "")

    return {
      scope: "tenant",
      tenantId,
      projectId: null,
      tenantSuffix: normalizeSuffix(tenantMatch[2] ?? "", "/overview"),
      projectSuffix: "/dashboard",
    }
  }

  return {
    scope: "other",
    tenantId: null,
    projectId: null,
    tenantSuffix: "/overview",
    projectSuffix: "/dashboard",
  }
}

export function resolveWorkspaceSelection(
  pathname: string,
  tenants: readonly WorkspaceTenant[],
  preferredTenantId: string | null,
): WorkspaceSelection {
  const parsedPath = parseWorkspacePath(pathname)
  const safeTenants = tenants.length > 0 ? tenants : DEFAULT_TENANTS
  const fallbackTenant = safeTenants[0] ?? FALLBACK_TENANT

  const tenant =
    findTenantById(safeTenants, parsedPath.tenantId) ??
    findTenantById(safeTenants, preferredTenantId) ??
    fallbackTenant
  const project = tenant
    ? (findProjectById(tenant, parsedPath.projectId) ?? tenant.projects[0] ?? null)
    : null

  if (!tenant) {
    return {
      scope: parsedPath.scope,
      tenant: FALLBACK_TENANT,
      project: FALLBACK_TENANT.projects[0] ?? null,
    }
  }

  return {
    scope: parsedPath.scope,
    tenant,
    project,
  }
}

export function buildTenantPath(tenantId: string, suffix = "/overview") {
  return `/t/${encodePathSegment(tenantId)}${normalizeSuffix(suffix, "/overview")}`
}

export function buildProjectPath(tenantId: string, projectId: string, suffix = "/dashboard") {
  return `/t/${encodePathSegment(tenantId)}/p/${encodePathSegment(projectId)}${normalizeSuffix(suffix, "/dashboard")}`
}

export function buildTenantSwitchPath(
  pathname: string,
  nextTenantId: string,
  nextProjectId: string | null,
) {
  const parsedPath = parseWorkspacePath(pathname)

  if (parsedPath.scope === "project" && nextProjectId) {
    return buildProjectPath(nextTenantId, nextProjectId, parsedPath.projectSuffix)
  }

  if (parsedPath.scope === "tenant") {
    return buildTenantPath(nextTenantId, parsedPath.tenantSuffix)
  }

  return buildTenantPath(nextTenantId, "/overview")
}

export function buildProjectSwitchPath(pathname: string, tenantId: string, projectId: string) {
  const parsedPath = parseWorkspacePath(pathname)

  if (parsedPath.scope === "project") {
    return buildProjectPath(tenantId, projectId, parsedPath.projectSuffix)
  }

  return buildProjectPath(tenantId, projectId, "/dashboard")
}
