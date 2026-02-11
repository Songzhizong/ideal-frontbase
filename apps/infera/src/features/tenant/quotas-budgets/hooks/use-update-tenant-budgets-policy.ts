import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateTenantBudgetsPolicy } from "../api/update-tenant-budgets-policy"
import type { UpdateTenantBudgetsPolicyInput } from "../types/tenant-quotas-budgets"

export function useUpdateTenantBudgetsPolicy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateTenantBudgetsPolicyInput) => updateTenantBudgetsPolicy(input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["infera", "tenant", "quotas-budgets", variables.tenantId],
      })
      void queryClient.invalidateQueries({
        queryKey: ["infera", "tenant", "quotas-budgets", variables.tenantId, "policy-history"],
      })
    },
  })
}
