import { useQuery } from "@tanstack/react-query"
import { getProjectFineTuningJobs } from "../api"
import type { FineTuningFilterState } from "../types"

export function getProjectFineTuningQueryKey(
  tenantId: string,
  projectId: string,
  filters: FineTuningFilterState,
) {
  return [
    "infera",
    "project",
    "fine-tuning",
    tenantId,
    projectId,
    filters.q,
    filters.status,
    filters.method,
    filters.createdBy,
    filters.timeRange,
  ] as const
}

export function useProjectFineTuningQuery(
  tenantId: string,
  projectId: string,
  filters: FineTuningFilterState,
) {
  return useQuery({
    queryKey: getProjectFineTuningQueryKey(tenantId, projectId, filters),
    queryFn: () => getProjectFineTuningJobs(tenantId, projectId, filters),
    enabled: tenantId.length > 0 && projectId.length > 0,
    staleTime: 30 * 1000,
  })
}
