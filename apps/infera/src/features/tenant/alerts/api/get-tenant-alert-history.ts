import { z } from "zod"
import { api } from "@/features/core/api"
import {
  TENANT_ALERT_EVENTS,
  TENANT_ALERT_STATUSES,
  TENANT_ALERT_TYPES,
  type TenantAlertHistoryResponse,
} from "../types/tenant-alerts"

const GetTenantAlertHistoryInputSchema = z.object({
  tenantId: z.string().min(1, "tenantId is required."),
  event: z.enum(TENANT_ALERT_EVENTS).optional(),
  type: z.enum(TENANT_ALERT_TYPES).optional(),
  status: z.enum(TENANT_ALERT_STATUSES).optional(),
})

export type GetTenantAlertHistoryInput = z.input<typeof GetTenantAlertHistoryInputSchema>

export async function getTenantAlertHistory(
  input: GetTenantAlertHistoryInput,
): Promise<TenantAlertHistoryResponse> {
  const payload = GetTenantAlertHistoryInputSchema.parse(input)

  const searchParams: Record<string, string> = {}
  if (payload.event) {
    searchParams.event = payload.event
  }
  if (payload.type) {
    searchParams.type = payload.type
  }
  if (payload.status) {
    searchParams.status = payload.status
  }

  const json = await api
    .withTenantId()
    .get(`infera-api/tenants/${encodeURIComponent(payload.tenantId)}/alerts/history`, {
      searchParams,
    })
    .json()

  return json as TenantAlertHistoryResponse
}
