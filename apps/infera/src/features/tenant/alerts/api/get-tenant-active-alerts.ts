import { z } from "zod"
import { api } from "@/features/core/api"
import {
  TENANT_ALERT_STATUSES,
  TENANT_ALERT_TYPES,
  type TenantActiveAlertsResponse,
} from "../types/tenant-alerts"

const GetTenantActiveAlertsInputSchema = z.object({
  tenantId: z.string().min(1, "tenantId is required."),
  status: z.enum(TENANT_ALERT_STATUSES).optional(),
  type: z.enum(TENANT_ALERT_TYPES).optional(),
})

export type GetTenantActiveAlertsInput = z.input<typeof GetTenantActiveAlertsInputSchema>

export async function getTenantActiveAlerts(
  input: GetTenantActiveAlertsInput,
): Promise<TenantActiveAlertsResponse> {
  const payload = GetTenantActiveAlertsInputSchema.parse(input)

  const searchParams: Record<string, string> = {}
  if (payload.status) {
    searchParams.status = payload.status
  }
  if (payload.type) {
    searchParams.type = payload.type
  }

  const json = await api
    .withTenantId()
    .get(`infera-api/tenants/${encodeURIComponent(payload.tenantId)}/alerts/active`, {
      searchParams,
    })
    .json()

  return json as TenantActiveAlertsResponse
}
