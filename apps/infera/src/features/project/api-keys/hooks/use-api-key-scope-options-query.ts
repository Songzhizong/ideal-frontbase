import { useQuery } from "@tanstack/react-query"
import { getApiKeyScopeOptions } from "../api"

export function getApiKeyScopeOptionsQueryKey(tenantId: string, projectId: string) {
  return ["infera", "project", "api-keys", "scopes", tenantId, projectId] as const
}

export function useApiKeyScopeOptionsQuery(tenantId: string, projectId: string) {
  return useQuery({
    queryKey: getApiKeyScopeOptionsQueryKey(tenantId, projectId),
    queryFn: () => getApiKeyScopeOptions(tenantId, projectId),
    enabled: tenantId.length > 0 && projectId.length > 0,
    staleTime: 60 * 1000,
  })
}
