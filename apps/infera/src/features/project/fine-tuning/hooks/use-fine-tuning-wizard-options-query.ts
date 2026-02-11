import { useQuery } from "@tanstack/react-query"
import { getFineTuningWizardOptions } from "../api"

export function getFineTuningWizardOptionsQueryKey(tenantId: string, projectId: string) {
  return ["infera", "project", "fine-tuning", "wizard-options", tenantId, projectId] as const
}

export function useFineTuningWizardOptionsQuery(tenantId: string, projectId: string) {
  return useQuery({
    queryKey: getFineTuningWizardOptionsQueryKey(tenantId, projectId),
    queryFn: () => getFineTuningWizardOptions(tenantId, projectId),
    enabled: tenantId.length > 0 && projectId.length > 0,
    staleTime: 5 * 60 * 1000,
  })
}
