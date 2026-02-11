import { useQuery } from "@tanstack/react-query"
import { getProjectEvaluationRunDetail } from "../api"

export function getProjectEvaluationDetailQueryKey(
  tenantId: string,
  projectId: string,
  evalRunId: string,
) {
  return ["infera", "project", "evaluation", "detail", tenantId, projectId, evalRunId] as const
}

export function useProjectEvaluationDetailQuery(
  tenantId: string,
  projectId: string,
  evalRunId: string,
) {
  return useQuery({
    queryKey: getProjectEvaluationDetailQueryKey(tenantId, projectId, evalRunId),
    queryFn: () => getProjectEvaluationRunDetail(tenantId, projectId, evalRunId),
    enabled: tenantId.length > 0 && projectId.length > 0 && evalRunId.length > 0,
    staleTime: 30 * 1000,
  })
}
