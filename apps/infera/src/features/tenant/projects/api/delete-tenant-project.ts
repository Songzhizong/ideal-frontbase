import { z } from "zod"
import { api } from "@/features/core/api"
import type { DeleteTenantProjectInput } from "../types/tenant-projects"

const DeleteTenantProjectInputSchema = z.object({
  tenantId: z.string().min(1, "tenantId is required."),
  projectId: z.string().min(1, "projectId is required."),
})

function toPayload(input: DeleteTenantProjectInput) {
  return DeleteTenantProjectInputSchema.parse(input)
}

export async function deleteTenantProject(input: DeleteTenantProjectInput) {
  const payload = toPayload(input)

  await api
    .withTenantId()
    .delete(
      `infera-api/tenants/${encodeURIComponent(payload.tenantId)}/projects/${encodeURIComponent(payload.projectId)}`,
    )
    .text()
}
