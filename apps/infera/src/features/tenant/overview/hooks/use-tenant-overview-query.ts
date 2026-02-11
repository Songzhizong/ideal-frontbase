import { useQuery } from "@tanstack/react-query"
import { type GetTenantOverviewInput, getTenantOverview } from "../api/get-tenant-overview"

export function useTenantOverviewQuery(input: GetTenantOverviewInput) {
  const range = input.range ?? "7d"

  return useQuery({
    queryKey: ["tenant", "overview", input.tenantId, range],
    queryFn: () => getTenantOverview({ ...input, range }),
    enabled: input.tenantId.length > 0,
    staleTime: 60 * 1000,
  })
}
