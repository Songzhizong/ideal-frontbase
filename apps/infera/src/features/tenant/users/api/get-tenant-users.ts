import { api } from "@/features/core/api"
import type { TenantUsersListResponse, TenantUsersTableFilters } from "../types/tenant-users"

export interface GetTenantUsersInput {
  tenantId: string
  page: number
  size: number
  filters: TenantUsersTableFilters
}

export async function getTenantUsers(input: GetTenantUsersInput): Promise<TenantUsersListResponse> {
  const searchParams: Record<string, string | number> = {
    pageNumber: input.page,
    pageSize: input.size,
  }

  if (input.filters.q.trim()) searchParams.q = input.filters.q.trim()
  if (input.filters.role) searchParams.role = input.filters.role
  if (input.filters.status) searchParams.status = input.filters.status

  return api
    .withTenantId()
    .get(`infera-api/tenants/${encodeURIComponent(input.tenantId)}/users`, {
      searchParams,
    })
    .json<TenantUsersListResponse>()
}
