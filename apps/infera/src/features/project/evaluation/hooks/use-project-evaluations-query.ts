import { useQuery } from "@tanstack/react-query"
import { getProjectEvaluationRuns } from "../api"
import type { EvaluationFilterState } from "../types"

export function getProjectEvaluationsQueryKey(
  tenantId: string,
  projectId: string,
  filters: EvaluationFilterState,
) {
  return [
    "infera",
    "project",
    "evaluation",
    tenantId,
    projectId,
    filters.q,
    filters.status,
    filters.type,
    filters.result,
  ] as const
}

export function useProjectEvaluationsQuery(
  tenantId: string,
  projectId: string,
  filters: EvaluationFilterState,
) {
  return useQuery({
    queryKey: getProjectEvaluationsQueryKey(tenantId, projectId, filters),
    queryFn: () => getProjectEvaluationRuns(tenantId, projectId, filters),
    enabled: tenantId.length > 0 && projectId.length > 0,
    staleTime: 30 * 1000,
  })
}
