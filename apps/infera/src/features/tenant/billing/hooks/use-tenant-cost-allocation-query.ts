import { useQuery } from "@tanstack/react-query"
import {
  type GetTenantCostAllocationInput,
  getTenantCostAllocation,
} from "../api/get-tenant-cost-allocation"

export function useTenantCostAllocationQuery(input: GetTenantCostAllocationInput) {
  const range = input.range ?? "30d"
  const groupBy = input.groupBy ?? "project"

  return useQuery({
    queryKey: ["tenant", "billing", "cost-allocation", input.tenantId, range, groupBy],
    queryFn: () =>
      getTenantCostAllocation({
        ...input,
        range,
        groupBy,
      }),
    enabled: input.tenantId.length > 0,
    staleTime: 60 * 1000,
  })
}
