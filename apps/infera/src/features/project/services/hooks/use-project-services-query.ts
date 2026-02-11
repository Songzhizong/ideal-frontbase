import { useQuery } from "@tanstack/react-query"
import { getProjectServices } from "../api"
import type { ServiceFilterState } from "../types"

export function getProjectServicesQueryKey(
  tenantId: string,
  projectId: string,
  filters: ServiceFilterState,
) {
  return [
    "infera",
    "project",
    "services",
    "list",
    tenantId,
    projectId,
    filters.q,
    filters.env,
    filters.state,
    filters.runtime,
    filters.model,
    filters.onlyInactive,
    filters.errorRateRange,
  ] as const
}

export function useProjectServicesQuery(
  tenantId: string,
  projectId: string,
  filters: ServiceFilterState,
) {
  return useQuery({
    queryKey: getProjectServicesQueryKey(tenantId, projectId, filters),
    queryFn: () => getProjectServices(tenantId, projectId, filters),
    enabled: tenantId.length > 0 && projectId.length > 0,
    staleTime: 30 * 1000,
  })
}
