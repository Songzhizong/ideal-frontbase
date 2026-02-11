import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { type GetTenantInvoicesInput, getTenantInvoices } from "../api/get-tenant-invoices"

export function useTenantBillingInvoicesQuery(input: GetTenantInvoicesInput) {
  const page = input.page ?? 1
  const size = input.size ?? 10

  return useQuery({
    queryKey: ["tenant", "billing", "invoices", input.tenantId, page, size, input.status ?? null],
    queryFn: () =>
      getTenantInvoices({
        ...input,
        page,
        size,
      }),
    enabled: input.tenantId.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  })
}
