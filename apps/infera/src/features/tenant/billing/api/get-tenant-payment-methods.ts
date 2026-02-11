import { z } from "zod"
import { api } from "@/features/core/api"
import type { TenantPaymentMethodsResponse } from "../types/tenant-billing"

const GetTenantPaymentMethodsInputSchema = z.object({
  tenantId: z.string().min(1, "tenantId is required."),
})

export type GetTenantPaymentMethodsInput = z.input<typeof GetTenantPaymentMethodsInputSchema>

interface GetTenantPaymentMethodsPayload {
  tenantId: string
}

function toPayload(input: GetTenantPaymentMethodsInput): GetTenantPaymentMethodsPayload {
  return GetTenantPaymentMethodsInputSchema.parse(input)
}

export async function getTenantPaymentMethods(
  input: GetTenantPaymentMethodsInput,
): Promise<TenantPaymentMethodsResponse> {
  const payload = toPayload(input)
  const json = await api
    .withTenantId()
    .get(`infera-api/tenants/${encodeURIComponent(payload.tenantId)}/billing/payment-methods`)
    .json()

  return json as TenantPaymentMethodsResponse
}
