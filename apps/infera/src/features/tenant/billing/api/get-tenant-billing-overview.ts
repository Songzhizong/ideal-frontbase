import { z } from "zod"
import { api } from "@/features/core/api"
import type { TenantBillingOverviewResponse, TenantBillingRange } from "../types/tenant-billing"

export const TenantBillingRangeSchema = z.enum(["7d", "30d"])

const GetTenantBillingOverviewInputSchema = z.object({
  tenantId: z.string().min(1, "tenantId is required."),
  range: TenantBillingRangeSchema.default("30d"),
})

export type GetTenantBillingOverviewInput = z.input<typeof GetTenantBillingOverviewInputSchema>

interface GetTenantBillingOverviewPayload {
  tenantId: string
  range: TenantBillingRange
}

function toPayload(input: GetTenantBillingOverviewInput): GetTenantBillingOverviewPayload {
  return GetTenantBillingOverviewInputSchema.parse(input)
}

export async function getTenantBillingOverview(
  input: GetTenantBillingOverviewInput,
): Promise<TenantBillingOverviewResponse> {
  const payload = toPayload(input)
  const json = await api
    .withTenantId()
    .get(`infera-api/tenants/${encodeURIComponent(payload.tenantId)}/billing/overview`, {
      searchParams: {
        range: payload.range,
      },
    })
    .json()

  return json as TenantBillingOverviewResponse
}
