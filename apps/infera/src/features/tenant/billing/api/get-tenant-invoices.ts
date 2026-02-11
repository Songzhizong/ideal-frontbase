import { z } from "zod"
import { api } from "@/features/core/api"
import type { TenantInvoiceStatus, TenantInvoicesListResponse } from "../types/tenant-billing"

const TenantInvoiceStatusSchema = z.enum(["Paid", "Unpaid", "Overdue"])

const GetTenantInvoicesInputSchema = z.object({
  tenantId: z.string().min(1, "tenantId is required."),
  page: z.number().int().positive().default(1),
  size: z.number().int().positive().max(100).default(10),
  status: TenantInvoiceStatusSchema.nullable().optional(),
})

export type GetTenantInvoicesInput = z.input<typeof GetTenantInvoicesInputSchema>

interface GetTenantInvoicesPayload {
  tenantId: string
  page: number
  size: number
  status: TenantInvoiceStatus | null
}

function toPayload(input: GetTenantInvoicesInput): GetTenantInvoicesPayload {
  const parsed = GetTenantInvoicesInputSchema.parse(input)
  return {
    tenantId: parsed.tenantId,
    page: parsed.page,
    size: parsed.size,
    status: parsed.status ?? null,
  }
}

export async function getTenantInvoices(
  input: GetTenantInvoicesInput,
): Promise<TenantInvoicesListResponse> {
  const payload = toPayload(input)
  const searchParams: Record<string, string | number> = {
    pageNumber: payload.page,
    pageSize: payload.size,
  }

  if (payload.status) {
    searchParams.status = payload.status
  }

  const json = await api
    .withTenantId()
    .get(`infera-api/tenants/${encodeURIComponent(payload.tenantId)}/billing/invoices`, {
      searchParams,
    })
    .json()

  return json as TenantInvoicesListResponse
}
