import { z } from "zod"
import { api } from "@/features/core/api"
import type { AckProjectDashboardAlertInput } from "../types/project-dashboard"

const AckProjectDashboardAlertInputSchema = z.object({
  tenantId: z.string().min(1, "tenantId is required."),
  projectId: z.string().min(1, "projectId is required."),
  alertId: z.string().min(1, "alertId is required."),
})

interface AckProjectDashboardAlertPayload {
  tenantId: string
  projectId: string
  alertId: string
}

function toPayload(input: AckProjectDashboardAlertInput): AckProjectDashboardAlertPayload {
  return AckProjectDashboardAlertInputSchema.parse(input)
}

export async function ackProjectDashboardAlert(
  input: AckProjectDashboardAlertInput,
): Promise<void> {
  const payload = toPayload(input)

  await api
    .withTenantId()
    .post(
      `infera-api/tenants/${encodeURIComponent(payload.tenantId)}/projects/${encodeURIComponent(payload.projectId)}/dashboard/alerts/${encodeURIComponent(payload.alertId)}/ack`,
    )
}
