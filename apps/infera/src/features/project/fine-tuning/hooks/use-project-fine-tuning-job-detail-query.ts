import { useQuery } from "@tanstack/react-query"
import { getProjectFineTuningJobDetail } from "../api"

export function getProjectFineTuningJobDetailQueryKey(
  tenantId: string,
  projectId: string,
  jobId: string,
) {
  return ["infera", "project", "fine-tuning", "detail", tenantId, projectId, jobId] as const
}

export function useProjectFineTuningJobDetailQuery(
  tenantId: string,
  projectId: string,
  jobId: string,
) {
  return useQuery({
    queryKey: getProjectFineTuningJobDetailQueryKey(tenantId, projectId, jobId),
    queryFn: () => getProjectFineTuningJobDetail(tenantId, projectId, jobId),
    enabled: tenantId.length > 0 && projectId.length > 0 && jobId.length > 0,
    staleTime: 30 * 1000,
  })
}
