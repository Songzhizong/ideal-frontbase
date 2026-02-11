import { useQuery } from "@tanstack/react-query"
import { getProjectApiKeys } from "../api"
import type { ApiKeyFilterState } from "../types"

export function getProjectApiKeysQueryKey(
  tenantId: string,
  projectId: string,
  filters: ApiKeyFilterState,
) {
  return [
    "infera",
    "project",
    "api-keys",
    "list",
    tenantId,
    projectId,
    filters.q,
    filters.status,
    filters.scope,
    filters.expiringSoon,
  ] as const
}

export function useProjectApiKeysQuery(
  tenantId: string,
  projectId: string,
  filters: ApiKeyFilterState,
) {
  return useQuery({
    queryKey: getProjectApiKeysQueryKey(tenantId, projectId, filters),
    queryFn: () => getProjectApiKeys(tenantId, projectId, filters),
    enabled: tenantId.length > 0 && projectId.length > 0,
    staleTime: 20 * 1000,
  })
}
