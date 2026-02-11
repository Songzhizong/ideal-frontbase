import { useQuery } from "@tanstack/react-query"
import { type GetTenantAlertRulesInput, getTenantAlertRules } from "../api/get-tenant-alert-rules"

export function useTenantAlertRulesQuery(input: GetTenantAlertRulesInput) {
  return useQuery({
    queryKey: ["infera", "tenant", "alerts", input.tenantId, "rules"],
    queryFn: () => getTenantAlertRules(input),
    enabled: input.tenantId.length > 0,
    staleTime: 20 * 1000,
  })
}
