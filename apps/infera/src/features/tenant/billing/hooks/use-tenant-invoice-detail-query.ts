import { useQuery } from "@tanstack/react-query"
import {
  type GetTenantInvoiceDetailInput,
  getTenantInvoiceDetail,
} from "../api/get-tenant-invoice-detail"

interface UseTenantInvoiceDetailQueryInput extends GetTenantInvoiceDetailInput {
  enabled?: boolean
}

export function useTenantInvoiceDetailQuery(input: UseTenantInvoiceDetailQueryInput) {
  return useQuery({
    queryKey: ["tenant", "billing", "invoice", input.tenantId, input.invoiceId],
    queryFn: () => getTenantInvoiceDetail(input),
    enabled: input.enabled ?? true,
    staleTime: 5 * 60 * 1000,
  })
}
