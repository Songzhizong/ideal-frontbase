import { useQuery } from "@tanstack/react-query"
import { getEvaluationWizardOptions } from "../api"

export function getEvaluationWizardOptionsQueryKey(tenantId: string, projectId: string) {
  return ["infera", "project", "evaluation", "wizard-options", tenantId, projectId] as const
}

export function useEvaluationWizardOptionsQuery(tenantId: string, projectId: string) {
  return useQuery({
    queryKey: getEvaluationWizardOptionsQueryKey(tenantId, projectId),
    queryFn: () => getEvaluationWizardOptions(tenantId, projectId),
    enabled: tenantId.length > 0 && projectId.length > 0,
    staleTime: 5 * 60 * 1000,
  })
}
