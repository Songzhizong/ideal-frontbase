import { z } from "zod"
import { api } from "@/features/core/api"
import type { TenantQuotasBudgetsResponse } from "../types/tenant-quotas-budgets"

const GetTenantQuotasBudgetsInputSchema = z.object({
  tenantId: z.string().min(1, "tenantId is required."),
})

export type GetTenantQuotasBudgetsInput = z.input<typeof GetTenantQuotasBudgetsInputSchema>

interface GetTenantQuotasBudgetsPayload {
  tenantId: string
}

function toPayload(input: GetTenantQuotasBudgetsInput): GetTenantQuotasBudgetsPayload {
  return GetTenantQuotasBudgetsInputSchema.parse(input)
}

export async function getTenantQuotasBudgets(
  input: GetTenantQuotasBudgetsInput,
): Promise<TenantQuotasBudgetsResponse> {
  const payload = toPayload(input)
  const json = await api
    .withTenantId()
    .get(`infera-api/tenants/${encodeURIComponent(payload.tenantId)}/quotas-budgets`)
    .json()

  return json as TenantQuotasBudgetsResponse
}
