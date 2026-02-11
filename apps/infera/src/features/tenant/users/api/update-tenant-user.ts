import { api } from "@/features/core/api"
import type { ToggleTenantUserStatusInput, UpdateTenantUserRoleInput } from "../types/tenant-users"

export async function updateTenantUserRole(input: UpdateTenantUserRoleInput): Promise<void> {
  await api
    .withTenantId()
    .patch(
      `infera-api/tenants/${encodeURIComponent(input.tenantId)}/users/${encodeURIComponent(input.userId)}/role`,
      {
        json: { role: input.role },
      },
    )
    .json()
}

export async function toggleTenantUserStatus(input: ToggleTenantUserStatusInput): Promise<void> {
  await api
    .withTenantId()
    .patch(
      `infera-api/tenants/${encodeURIComponent(input.tenantId)}/users/${encodeURIComponent(input.userId)}/status`,
      {
        json: { status: input.status },
      },
    )
    .json()
}
