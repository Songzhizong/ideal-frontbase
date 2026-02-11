import { z } from "zod"
import { api } from "@/features/core/api"
import type { TenantAlertRuleItem, UpdateTenantAlertRuleInput } from "../types/tenant-alerts"
import { UpsertTenantAlertRulePayloadSchema } from "./alert-rule-schema"

const UpdateTenantAlertRuleInputSchema = z.object({
  tenantId: z.string().min(1, "tenantId is required."),
  ruleId: z.string().min(1, "ruleId is required."),
  payload: UpsertTenantAlertRulePayloadSchema,
})

interface UpdateTenantAlertRulePayload {
  tenantId: string
  ruleId: string
  payload: z.infer<typeof UpsertTenantAlertRulePayloadSchema>
}

function toPayload(input: UpdateTenantAlertRuleInput): UpdateTenantAlertRulePayload {
  return UpdateTenantAlertRuleInputSchema.parse(input)
}

export async function updateTenantAlertRule(
  input: UpdateTenantAlertRuleInput,
): Promise<TenantAlertRuleItem> {
  const payload = toPayload(input)

  const json = await api
    .withTenantId()
    .put(
      `infera-api/tenants/${encodeURIComponent(payload.tenantId)}/alerts/rules/${encodeURIComponent(payload.ruleId)}`,
      {
        json: payload.payload,
      },
    )
    .json()

  return json as TenantAlertRuleItem
}
