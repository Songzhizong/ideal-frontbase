import { useQuery } from "@tanstack/react-query"
import { getProjectDatasetDetail } from "../api"

export function getProjectDatasetDetailQueryKey(
  tenantId: string,
  projectId: string,
  datasetId: string,
) {
  return ["infera", "project", "dataset-detail", tenantId, projectId, datasetId] as const
}

export function useProjectDatasetDetailQuery(
  tenantId: string,
  projectId: string,
  datasetId: string,
) {
  return useQuery({
    queryKey: getProjectDatasetDetailQueryKey(tenantId, projectId, datasetId),
    queryFn: () => getProjectDatasetDetail(tenantId, projectId, datasetId),
    enabled: tenantId.length > 0 && projectId.length > 0 && datasetId.length > 0,
    staleTime: 30 * 1000,
  })
}
