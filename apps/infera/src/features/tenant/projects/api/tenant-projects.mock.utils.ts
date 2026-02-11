import type {
  TenantProjectEnvironment,
  TenantProjectItem,
  TenantProjectRole,
  TenantProjectsTableFilters,
} from "../types/tenant-projects"

export function parsePositiveInt(rawValue: string | null, fallback: number) {
  if (!rawValue) {
    return fallback
  }

  const parsed = Number(rawValue)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback
  }

  return parsed
}

export function parseSort(rawSort: string | null) {
  if (!rawSort) {
    return [] as Array<{ field: string; order: "asc" | "desc" }>
  }

  return rawSort
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map((item) => {
      const [field, order] = item.split(".")
      if (!field || (order !== "asc" && order !== "desc")) {
        return null
      }

      return {
        field,
        order,
      } satisfies { field: string; order: "asc" | "desc" }
    })
    .filter((item): item is { field: string; order: "asc" | "desc" } => item !== null)
}

function matchCostRange(cost: number, costRange: string) {
  switch (costRange) {
    case "lt_1000":
      return cost < 1000
    case "between_1000_5000":
      return cost >= 1000 && cost < 5000
    case "between_5000_20000":
      return cost >= 5000 && cost < 20000
    case "gte_20000":
      return cost >= 20000
    default:
      return true
  }
}

export function applyFilters(projects: TenantProjectItem[], filters: TenantProjectsTableFilters) {
  return projects.filter((project) => {
    const query = filters.q.trim().toLowerCase()
    if (
      query.length > 0 &&
      !project.projectName.toLowerCase().includes(query) &&
      !project.projectId.toLowerCase().includes(query)
    ) {
      return false
    }

    if (filters.environment && project.environment !== filters.environment) {
      return false
    }

    if (filters.ownerId && project.ownerId !== filters.ownerId) {
      return false
    }

    if (filters.costRange && !matchCostRange(project.monthlyEstimatedCostCny, filters.costRange)) {
      return false
    }

    return true
  })
}

function compareProjectByField(left: TenantProjectItem, right: TenantProjectItem, field: string) {
  switch (field) {
    case "projectName":
      return left.projectName.localeCompare(right.projectName, "zh-CN")
    case "environment":
      return left.environment.localeCompare(right.environment, "zh-CN")
    case "ownerName":
      return left.ownerName.localeCompare(right.ownerName, "zh-CN")
    case "serviceSummary":
      return left.serviceSummary.ready - right.serviceSummary.ready
    case "monthlyEstimatedCostCny":
      return left.monthlyEstimatedCostCny - right.monthlyEstimatedCostCny
    case "tokensToday":
      return left.tokensToday - right.tokensToday
    case "updatedAt":
      return Date.parse(left.updatedAt) - Date.parse(right.updatedAt)
    default:
      return 0
  }
}

export function applySort(
  projects: TenantProjectItem[],
  sort: Array<{ field: string; order: "asc" | "desc" }>,
) {
  const firstSort = sort[0]
  if (!firstSort) {
    return projects
  }

  const direction = firstSort.order === "asc" ? 1 : -1
  return [...projects].sort((left, right) => {
    return compareProjectByField(left, right, firstSort.field) * direction
  })
}

export function paginateProjects(
  projects: TenantProjectItem[],
  pageNumber: number,
  pageSize: number,
) {
  const totalElements = projects.length
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize))
  const normalizedPage = Math.min(pageNumber, totalPages)
  const start = (normalizedPage - 1) * pageSize
  const end = start + pageSize

  return {
    content: projects.slice(start, end),
    pageNumber: normalizedPage,
    pageSize,
    totalElements,
    totalPages,
  }
}

export function parseFilters(url: URL): TenantProjectsTableFilters {
  return {
    q: url.searchParams.get("q") ?? "",
    environment: url.searchParams.get("environment"),
    ownerId: url.searchParams.get("ownerId"),
    costRange: url.searchParams.get("costRange"),
  }
}

export function parseEnvironment(value: unknown): TenantProjectEnvironment {
  if (value === "Prod" || value === "Test") {
    return value
  }

  return "Dev"
}

export function parseInitialMembers(
  value: unknown,
): Array<{ userId: string; role: TenantProjectRole }> {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((item): item is { userId: string; role: TenantProjectRole } => {
      if (typeof item !== "object" || item === null) {
        return false
      }

      const record = item as Record<string, unknown>
      const role = record.role
      return (
        typeof record.userId === "string" &&
        (role === "Owner" || role === "Maintainer" || role === "Member")
      )
    })
    .map((item) => ({
      userId: item.userId,
      role: item.role,
    }))
}
