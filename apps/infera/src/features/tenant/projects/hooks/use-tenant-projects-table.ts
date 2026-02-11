import { useMemo } from "react"
import type { DataTableColumnDef } from "@/packages/table"
import { remote, useDataTable } from "@/packages/table"
import { getTenantProjects } from "../api/get-tenant-projects"
import type {
  TenantProjectItem,
  TenantProjectMemberCandidate,
  TenantProjectOwnerOption,
  TenantProjectsTableFilters,
} from "../types/tenant-projects"
import { useTenantProjectsTableState } from "./use-tenant-projects-table-state"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isTenantProjectRole(value: unknown): value is TenantProjectMemberCandidate["defaultRole"] {
  return value === "Owner" || value === "Maintainer" || value === "Member"
}

function toOwnerOptions(value: unknown): TenantProjectOwnerOption[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((item): item is TenantProjectOwnerOption => {
      if (!isRecord(item)) {
        return false
      }

      return (
        typeof item.userId === "string" &&
        typeof item.displayName === "string" &&
        typeof item.email === "string"
      )
    })
    .map((item) => ({
      userId: item.userId,
      displayName: item.displayName,
      email: item.email,
    }))
}

function toMemberCandidates(value: unknown): TenantProjectMemberCandidate[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((item): item is TenantProjectMemberCandidate => {
      if (!isRecord(item)) {
        return false
      }

      return (
        typeof item.userId === "string" &&
        typeof item.displayName === "string" &&
        typeof item.email === "string" &&
        isTenantProjectRole(item.defaultRole)
      )
    })
    .map((item) => ({
      userId: item.userId,
      displayName: item.displayName,
      email: item.email,
      defaultRole: item.defaultRole,
    }))
}

function toExistingProjectNames(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === "string")
}

export interface TenantProjectsTableMeta {
  canCreateProject: boolean
  ownerOptions: TenantProjectOwnerOption[]
  memberCandidates: TenantProjectMemberCandidate[]
  existingProjectNames: string[]
}

export function resolveTenantProjectsTableMeta(meta: unknown): TenantProjectsTableMeta {
  if (!isRecord(meta)) {
    return {
      canCreateProject: false,
      ownerOptions: [],
      memberCandidates: [],
      existingProjectNames: [],
    }
  }

  return {
    canCreateProject: Boolean(meta.canCreateProject),
    ownerOptions: toOwnerOptions(meta.ownerOptions),
    memberCandidates: toMemberCandidates(meta.memberCandidates),
    existingProjectNames: toExistingProjectNames(meta.existingProjectNames),
  }
}

interface UseTenantProjectsTableOptions {
  tenantId: string
  columns: DataTableColumnDef<TenantProjectItem>[]
}

export function useTenantProjectsTable({ tenantId, columns }: UseTenantProjectsTableOptions) {
  const state = useTenantProjectsTableState(tenantId)

  const dataSource = useMemo(() => {
    return remote<
      TenantProjectItem,
      TenantProjectsTableFilters,
      Awaited<ReturnType<typeof getTenantProjects>>
    >({
      queryKey: ["infera", "tenant-projects", tenantId],
      queryFn: ({ page, size, sort, filters }) => {
        return getTenantProjects({
          tenantId,
          page,
          size,
          sort,
          filters,
        })
      },
      map: (response) => ({
        rows: response.content,
        pageCount: response.totalPages,
        total: response.totalElements,
        extraMeta: {
          canCreateProject: response.canCreateProject,
          ownerOptions: response.ownerOptions,
          memberCandidates: response.memberCandidates,
          existingProjectNames: response.existingProjectNames,
        },
      }),
    })
  }, [tenantId])

  const dt = useDataTable<TenantProjectItem, TenantProjectsTableFilters>({
    columns,
    dataSource,
    state,
    getRowId: (row) => row.projectId,
    features: {
      columnVisibility: {
        enabled: true,
        storageKey: `infera_tenant_projects_columns_${tenantId}`,
      },
      columnSizing: {
        enabled: true,
        storageKey: `infera_tenant_projects_sizes_${tenantId}`,
      },
      density: {
        enabled: true,
        storageKey: `infera_tenant_projects_density_${tenantId}`,
        default: "comfortable",
      },
      pinning: {
        enabled: true,
        left: ["projectName"],
        right: ["__actions__"],
      },
    },
  })

  return dt
}
