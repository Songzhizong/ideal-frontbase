import { useQuery } from "@tanstack/react-query"
import { getProjectUsage } from "../api"
import type { UsageFilterState } from "../types"

export function getProjectUsageQueryKey(
  tenantId: string,
  projectId: string,
  filters: UsageFilterState,
) {
  return [
    "infera",
    "project",
    "usage",
    tenantId,
    projectId,
    filters.range,
    filters.groupBy,
    filters.granularity,
    filters.serviceId,
    filters.revisionId,
    filters.apiKeyId,
    filters.modelVersionId,
    filters.statusFamily,
  ] as const
}

export function useProjectUsageQuery(
  tenantId: string,
  projectId: string,
  filters: UsageFilterState,
) {
  return useQuery({
    queryKey: getProjectUsageQueryKey(tenantId, projectId, filters),
    queryFn: () => getProjectUsage(tenantId, projectId, filters),
    enabled: tenantId.length > 0 && projectId.length > 0,
    staleTime: 20 * 1000,
  })
}
