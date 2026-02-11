import { z } from "zod"
import { api } from "@/features/core/api"
import type { AckTenantAlertInput } from "../types/tenant-alerts"

const AckTenantAlertInputSchema = z.object({
  tenantId: z.string().min(1, "tenantId is required."),
  alertId: z.string().min(1, "alertId is required."),
})

interface AckTenantAlertPayload {
  tenantId: string
  alertId: string
}

function toPayload(input: AckTenantAlertInput): AckTenantAlertPayload {
  return AckTenantAlertInputSchema.parse(input)
}

export async function ackTenantAlert(input: AckTenantAlertInput): Promise<void> {
  const payload = toPayload(input)

  await api
    .withTenantId()
    .post(
      `infera-api/tenants/${encodeURIComponent(payload.tenantId)}/alerts/${encodeURIComponent(payload.alertId)}/ack`,
    )
}
