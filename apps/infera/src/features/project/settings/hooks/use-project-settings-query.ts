import { useQuery } from "@tanstack/react-query"
import { getProjectSettings } from "../api"

export function getProjectSettingsQueryKey(tenantId: string, projectId: string) {
  return ["infera", "project", "settings", tenantId, projectId] as const
}

export function useProjectSettingsQuery(tenantId: string, projectId: string) {
  return useQuery({
    queryKey: getProjectSettingsQueryKey(tenantId, projectId),
    queryFn: () => getProjectSettings(tenantId, projectId),
    enabled: tenantId.length > 0 && projectId.length > 0,
    staleTime: 30 * 1000,
  })
}
