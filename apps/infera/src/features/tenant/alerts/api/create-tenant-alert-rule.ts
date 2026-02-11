import { z } from "zod"
import { api } from "@/features/core/api"
import type { CreateTenantAlertRuleInput, TenantAlertRuleItem } from "../types/tenant-alerts"
import { UpsertTenantAlertRulePayloadSchema } from "./alert-rule-schema"

const CreateTenantAlertRuleInputSchema = z.object({
  tenantId: z.string().min(1, "tenantId is required."),
  payload: UpsertTenantAlertRulePayloadSchema,
})

interface CreateTenantAlertRulePayload {
  tenantId: string
  payload: z.infer<typeof UpsertTenantAlertRulePayloadSchema>
}

function toPayload(input: CreateTenantAlertRuleInput): CreateTenantAlertRulePayload {
  return CreateTenantAlertRuleInputSchema.parse(input)
}

export async function createTenantAlertRule(
  input: CreateTenantAlertRuleInput,
): Promise<TenantAlertRuleItem> {
  const payload = toPayload(input)

  const json = await api
    .withTenantId()
    .post(`infera-api/tenants/${encodeURIComponent(payload.tenantId)}/alerts/rules`, {
      json: payload.payload,
    })
    .json()

  return json as TenantAlertRuleItem
}
