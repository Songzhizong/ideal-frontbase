import { z } from "zod"
import { api } from "@/features/core/api"
import type { TenantAuditLogDetail } from "../types/tenant-audit"

const GetTenantAuditLogDetailInputSchema = z.object({
  tenantId: z.string().min(1, "tenantId is required."),
  logId: z.string().min(1, "logId is required."),
})

export interface GetTenantAuditLogDetailInput {
  tenantId: string
  logId: string
}

export async function getTenantAuditLogDetail(
  input: GetTenantAuditLogDetailInput,
): Promise<TenantAuditLogDetail> {
  const payload = GetTenantAuditLogDetailInputSchema.parse(input)

  const json = await api
    .withTenantId()
    .get(`infera-api/tenants/${encodeURIComponent(payload.tenantId)}/audit/logs/${payload.logId}`)
    .json()

  return json as TenantAuditLogDetail
}
