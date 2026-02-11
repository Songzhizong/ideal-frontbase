import { z } from "zod"
import { api } from "@/features/core/api"
import type { TenantAlertRuleItem, ToggleTenantAlertRuleInput } from "../types/tenant-alerts"

const ToggleTenantAlertRuleInputSchema = z.object({
  tenantId: z.string().min(1, "tenantId is required."),
  ruleId: z.string().min(1, "ruleId is required."),
  enabled: z.boolean(),
})

interface ToggleTenantAlertRulePayload {
  tenantId: string
  ruleId: string
  enabled: boolean
}

function toPayload(input: ToggleTenantAlertRuleInput): ToggleTenantAlertRulePayload {
  return ToggleTenantAlertRuleInputSchema.parse(input)
}

export async function toggleTenantAlertRule(
  input: ToggleTenantAlertRuleInput,
): Promise<TenantAlertRuleItem> {
  const payload = toPayload(input)

  const json = await api
    .withTenantId()
    .patch(
      `infera-api/tenants/${encodeURIComponent(payload.tenantId)}/alerts/rules/${encodeURIComponent(payload.ruleId)}/enabled`,
      {
        json: {
          enabled: payload.enabled,
        },
      },
    )
    .json()

  return json as TenantAlertRuleItem
}
