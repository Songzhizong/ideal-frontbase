import { api } from "@/features/core/api"
import type { CreateTenantInviteInput } from "../types/tenant-users"

export async function createTenantInvitation(input: CreateTenantInviteInput): Promise<void> {
  await api
    .withTenantId()
    .post(`infera-api/tenants/${encodeURIComponent(input.tenantId)}/invitations`, {
      json: {
        emails: input.emails,
        role: input.role,
        projectAssignments: input.projectAssignments,
      },
    })
    .json()
}
