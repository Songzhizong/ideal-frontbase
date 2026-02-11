import { z } from "zod"
import { api } from "@/features/core/api"
import type { TenantInvoiceDetailResponse } from "../types/tenant-billing"

const GetTenantInvoiceDetailInputSchema = z.object({
  tenantId: z.string().min(1, "tenantId is required."),
  invoiceId: z.string().min(1, "invoiceId is required."),
})

export type GetTenantInvoiceDetailInput = z.input<typeof GetTenantInvoiceDetailInputSchema>

interface GetTenantInvoiceDetailPayload {
  tenantId: string
  invoiceId: string
}

function toPayload(input: GetTenantInvoiceDetailInput): GetTenantInvoiceDetailPayload {
  return GetTenantInvoiceDetailInputSchema.parse(input)
}

export async function getTenantInvoiceDetail(
  input: GetTenantInvoiceDetailInput,
): Promise<TenantInvoiceDetailResponse> {
  const payload = toPayload(input)
  const json = await api
    .withTenantId()
    .get(
      `infera-api/tenants/${encodeURIComponent(payload.tenantId)}/billing/invoices/${encodeURIComponent(payload.invoiceId)}`,
    )
    .json()

  return json as TenantInvoiceDetailResponse
}
