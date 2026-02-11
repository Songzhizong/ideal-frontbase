import { z } from "zod"
import { api } from "@/features/core/api"
import type { DeleteTenantAlertRuleInput } from "../types/tenant-alerts"

const DeleteTenantAlertRuleInputSchema = z.object({
  tenantId: z.string().min(1, "tenantId is required."),
  ruleId: z.string().min(1, "ruleId is required."),
})

interface DeleteTenantAlertRulePayload {
  tenantId: string
  ruleId: string
}

function toPayload(input: DeleteTenantAlertRuleInput): DeleteTenantAlertRulePayload {
  return DeleteTenantAlertRuleInputSchema.parse(input)
}

export async function deleteTenantAlertRule(input: DeleteTenantAlertRuleInput): Promise<void> {
  const payload = toPayload(input)

  await api
    .withTenantId()
    .delete(
      `infera-api/tenants/${encodeURIComponent(payload.tenantId)}/alerts/rules/${encodeURIComponent(payload.ruleId)}`,
    )
}
