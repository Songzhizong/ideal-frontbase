import { useQuery } from "@tanstack/react-query"
import { getProjectModelDetail } from "../api"

export function getProjectModelDetailQueryKey(
  tenantId: string,
  projectId: string,
  modelId: string,
) {
  return ["infera", "project", "model-detail", tenantId, projectId, modelId] as const
}

export function useProjectModelDetailQuery(tenantId: string, projectId: string, modelId: string) {
  return useQuery({
    queryKey: getProjectModelDetailQueryKey(tenantId, projectId, modelId),
    queryFn: () => getProjectModelDetail(tenantId, projectId, modelId),
    enabled: tenantId.length > 0 && projectId.length > 0 && modelId.length > 0,
    staleTime: 30 * 1000,
  })
}
