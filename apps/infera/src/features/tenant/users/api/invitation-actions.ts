import { api } from "@/features/core/api"
import type {
  DeleteTenantInvitationInput,
  ResendTenantInvitationInput,
} from "../types/tenant-users"

export async function resendTenantInvitation(input: ResendTenantInvitationInput): Promise<void> {
  await api
    .withTenantId()
    .post(
      `infera-api/tenants/${encodeURIComponent(input.tenantId)}/invitations/${encodeURIComponent(input.invitationId)}/resend`,
    )
    .json()
}

export async function deleteTenantInvitation(input: DeleteTenantInvitationInput): Promise<void> {
  await api
    .withTenantId()
    .delete(
      `infera-api/tenants/${encodeURIComponent(input.tenantId)}/invitations/${encodeURIComponent(input.invitationId)}`,
    )
    .json()
}
