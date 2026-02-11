import { useQuery } from "@tanstack/react-query"
import {
  type GetTenantQuotasBudgetsInput,
  getTenantQuotasBudgets,
} from "../api/get-tenant-quotas-budgets"

export function useTenantQuotasBudgetsQuery(input: GetTenantQuotasBudgetsInput) {
  return useQuery({
    queryKey: ["infera", "tenant", "quotas-budgets", input.tenantId],
    queryFn: () => getTenantQuotasBudgets(input),
    enabled: input.tenantId.length > 0,
    staleTime: 60 * 1000,
  })
}
