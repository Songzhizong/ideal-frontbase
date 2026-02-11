import { z } from "zod"
import { api } from "@/features/core/api"
import type { TenantPolicyHistoryResponse } from "../types/tenant-quotas-budgets"

const GetTenantPolicyHistoryInputSchema = z.object({
  tenantId: z.string().min(1, "tenantId is required."),
})

export type GetTenantPolicyHistoryInput = z.input<typeof GetTenantPolicyHistoryInputSchema>

interface GetTenantPolicyHistoryPayload {
  tenantId: string
}

function toPayload(input: GetTenantPolicyHistoryInput): GetTenantPolicyHistoryPayload {
  return GetTenantPolicyHistoryInputSchema.parse(input)
}

export async function getTenantPolicyHistory(
  input: GetTenantPolicyHistoryInput,
): Promise<TenantPolicyHistoryResponse> {
  const payload = toPayload(input)
  const json = await api
    .withTenantId()
    .get(`infera-api/tenants/${encodeURIComponent(payload.tenantId)}/quotas-budgets/policy-history`)
    .json()

  return json as TenantPolicyHistoryResponse
}
