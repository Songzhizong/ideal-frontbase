import { useQuery } from "@tanstack/react-query"
import {
  type GetTenantPaymentMethodsInput,
  getTenantPaymentMethods,
} from "../api/get-tenant-payment-methods"

export function useTenantPaymentMethodsQuery(input: GetTenantPaymentMethodsInput) {
  return useQuery({
    queryKey: ["tenant", "billing", "payment-methods", input.tenantId],
    queryFn: () => getTenantPaymentMethods(input),
    enabled: input.tenantId.length > 0,
    staleTime: 5 * 60 * 1000,
  })
}
