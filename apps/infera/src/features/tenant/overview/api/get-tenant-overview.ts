import { z } from "zod"
import { api } from "@/features/core/api"
import type { TenantOverviewRange, TenantOverviewResponse } from "../types/tenant-overview"

export const TenantOverviewRangeSchema = z.enum(["7d", "30d"])

const GetTenantOverviewInputSchema = z.object({
  tenantId: z.string().min(1, "tenantId is required."),
  range: TenantOverviewRangeSchema.default("7d"),
})

export type GetTenantOverviewInput = z.input<typeof GetTenantOverviewInputSchema>

interface GetTenantOverviewPayload {
  tenantId: string
  range: TenantOverviewRange
}

function toPayload(input: GetTenantOverviewInput): GetTenantOverviewPayload {
  return GetTenantOverviewInputSchema.parse(input)
}

export async function getTenantOverview(
  input: GetTenantOverviewInput,
): Promise<TenantOverviewResponse> {
  const payload = toPayload(input)
  const json = await api
    .withTenantId()
    .get(`infera-api/tenants/${encodeURIComponent(payload.tenantId)}/overview`, {
      searchParams: {
        range: payload.range,
      },
    })
    .json()

  return json as TenantOverviewResponse
}
