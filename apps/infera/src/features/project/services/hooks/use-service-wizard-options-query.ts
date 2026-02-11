import { useQuery } from "@tanstack/react-query"
import { getProjectServiceWizardOptions } from "../api"

export function getProjectServiceWizardOptionsQueryKey(tenantId: string, projectId: string) {
  return ["infera", "project", "services", "wizard-options", tenantId, projectId] as const
}

export function useProjectServiceWizardOptionsQuery(tenantId: string, projectId: string) {
  return useQuery({
    queryKey: getProjectServiceWizardOptionsQueryKey(tenantId, projectId),
    queryFn: () => getProjectServiceWizardOptions(tenantId, projectId),
    enabled: tenantId.length > 0 && projectId.length > 0,
    staleTime: 60 * 1000,
  })
}
