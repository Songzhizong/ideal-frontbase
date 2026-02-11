import { z } from "zod"
import { api } from "@/features/core/api"
import type {
  TenantBillingRange,
  TenantCostAllocationGroup,
  TenantCostAllocationResponse,
} from "../types/tenant-billing"

const TenantCostAllocationGroupSchema = z.enum(["project", "api_key", "service"])
const TenantBillingRangeSchema = z.enum(["7d", "30d"])

const GetTenantCostAllocationInputSchema = z.object({
  tenantId: z.string().min(1, "tenantId is required."),
  groupBy: TenantCostAllocationGroupSchema.default("project"),
  range: TenantBillingRangeSchema.default("30d"),
})

export type GetTenantCostAllocationInput = z.input<typeof GetTenantCostAllocationInputSchema>

interface GetTenantCostAllocationPayload {
  tenantId: string
  groupBy: TenantCostAllocationGroup
  range: TenantBillingRange
}

function toPayload(input: GetTenantCostAllocationInput): GetTenantCostAllocationPayload {
  return GetTenantCostAllocationInputSchema.parse(input)
}

export async function getTenantCostAllocation(
  input: GetTenantCostAllocationInput,
): Promise<TenantCostAllocationResponse> {
  const payload = toPayload(input)
  const json = await api
    .withTenantId()
    .get(`infera-api/tenants/${encodeURIComponent(payload.tenantId)}/billing/cost-allocation`, {
      searchParams: {
        groupBy: payload.groupBy,
        range: payload.range,
      },
    })
    .json()

  return json as TenantCostAllocationResponse
}
