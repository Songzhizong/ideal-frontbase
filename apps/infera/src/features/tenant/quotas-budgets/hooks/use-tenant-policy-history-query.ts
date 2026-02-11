import { useQuery } from "@tanstack/react-query"
import {
  type GetTenantPolicyHistoryInput,
  getTenantPolicyHistory,
} from "../api/get-tenant-policy-history"

export function useTenantPolicyHistoryQuery(input: GetTenantPolicyHistoryInput) {
  return useQuery({
    queryKey: ["infera", "tenant", "quotas-budgets", input.tenantId, "policy-history"],
    queryFn: () => getTenantPolicyHistory(input),
    enabled: input.tenantId.length > 0,
    staleTime: 60 * 1000,
  })
}
