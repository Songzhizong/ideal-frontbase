import { useQuery } from "@tanstack/react-query"
import {
  type GetTenantBillingOverviewInput,
  getTenantBillingOverview,
} from "../api/get-tenant-billing-overview"

export function useTenantBillingOverviewQuery(input: GetTenantBillingOverviewInput) {
  const range = input.range ?? "30d"

  return useQuery({
    queryKey: ["tenant", "billing", "overview", input.tenantId, range],
    queryFn: () => getTenantBillingOverview({ ...input, range }),
    enabled: input.tenantId.length > 0,
    staleTime: 60 * 1000,
  })
}
