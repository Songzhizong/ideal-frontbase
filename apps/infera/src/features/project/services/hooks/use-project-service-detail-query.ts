import { useQuery } from "@tanstack/react-query"
import { getProjectServiceDetail } from "../api"

export function getProjectServiceDetailQueryKey(
  tenantId: string,
  projectId: string,
  serviceId: string,
) {
  return ["infera", "project", "services", "detail", tenantId, projectId, serviceId] as const
}

export function useProjectServiceDetailQuery(
  tenantId: string,
  projectId: string,
  serviceId: string,
) {
  return useQuery({
    queryKey: getProjectServiceDetailQueryKey(tenantId, projectId, serviceId),
    queryFn: () => getProjectServiceDetail(tenantId, projectId, serviceId),
    enabled: tenantId.length > 0 && projectId.length > 0 && serviceId.length > 0,
    staleTime: 20 * 1000,
  })
}
