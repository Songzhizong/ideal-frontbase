import { api } from "@/features/core/api"
import type {
  TenantInvitationsListResponse,
  TenantInvitationsTableFilters,
} from "../types/tenant-users"

export interface GetTenantInvitationsInput {
  tenantId: string
  page: number
  size: number
  filters: TenantInvitationsTableFilters
}

export async function getTenantInvitations(
  input: GetTenantInvitationsInput,
): Promise<TenantInvitationsListResponse> {
  const searchParams: Record<string, string | number> = {
    pageNumber: input.page,
    pageSize: input.size,
  }

  if (input.filters.q.trim()) searchParams.q = input.filters.q.trim()

  return api
    .withTenantId()
    .get(`infera-api/tenants/${encodeURIComponent(input.tenantId)}/invitations`, {
      searchParams,
    })
    .json<TenantInvitationsListResponse>()
}
