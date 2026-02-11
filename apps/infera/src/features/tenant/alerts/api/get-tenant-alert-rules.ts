import { z } from "zod"
import { api } from "@/features/core/api"
import type { TenantAlertRulesResponse } from "../types/tenant-alerts"

const GetTenantAlertRulesInputSchema = z.object({
  tenantId: z.string().min(1, "tenantId is required."),
})

export type GetTenantAlertRulesInput = z.input<typeof GetTenantAlertRulesInputSchema>

interface GetTenantAlertRulesPayload {
  tenantId: string
}

function toPayload(input: GetTenantAlertRulesInput): GetTenantAlertRulesPayload {
  return GetTenantAlertRulesInputSchema.parse(input)
}

export async function getTenantAlertRules(
  input: GetTenantAlertRulesInput,
): Promise<TenantAlertRulesResponse> {
  const payload = toPayload(input)

  const json = await api
    .withTenantId()
    .get(`infera-api/tenants/${encodeURIComponent(payload.tenantId)}/alerts/rules`)
    .json()

  return json as TenantAlertRulesResponse
}
