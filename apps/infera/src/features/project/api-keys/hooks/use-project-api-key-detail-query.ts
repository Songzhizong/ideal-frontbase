import { useQuery } from "@tanstack/react-query"
import { getProjectApiKeyDetail } from "../api"

export function getProjectApiKeyDetailQueryKey(
  tenantId: string,
  projectId: string,
  apiKeyId: string,
) {
  return ["infera", "project", "api-keys", "detail", tenantId, projectId, apiKeyId] as const
}

export function useProjectApiKeyDetailQuery(tenantId: string, projectId: string, apiKeyId: string) {
  return useQuery({
    queryKey: getProjectApiKeyDetailQueryKey(tenantId, projectId, apiKeyId),
    queryFn: () => getProjectApiKeyDetail(tenantId, projectId, apiKeyId),
    enabled: tenantId.length > 0 && projectId.length > 0 && apiKeyId.length > 0,
    staleTime: 20 * 1000,
  })
}
