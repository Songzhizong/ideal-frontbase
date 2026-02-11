import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateTenantQuotasPolicy } from "../api/update-tenant-quotas-policy"
import type { UpdateTenantQuotasPolicyInput } from "../types/tenant-quotas-budgets"

export function useUpdateTenantQuotasPolicy() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateTenantQuotasPolicyInput) => updateTenantQuotasPolicy(input),
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
