import { useQuery } from "@tanstack/react-query"
import { getProjectModels } from "../api"
import type { ModelFilterState, ModelTabType } from "../types/project-models"

export function getProjectModelsQueryKey(
  tenantId: string,
  projectId: string,
  tab: ModelTabType,
  filters: ModelFilterState,
) {
  return [
    "infera",
    "project",
    "models",
    tenantId,
    projectId,
    tab,
    filters.source,
    filters.visibility,
    filters.license,
    filters.format,
    filters.artifactType,
    filters.quantization,
    filters.q,
  ] as const
}

export function useProjectModelsQuery(
  tenantId: string,
  projectId: string,
  tab: ModelTabType,
  filters: ModelFilterState,
) {
  return useQuery({
    queryKey: getProjectModelsQueryKey(tenantId, projectId, tab, filters),
    queryFn: () => getProjectModels(tenantId, projectId, tab, filters),
    enabled: tenantId.length > 0 && projectId.length > 0,
    staleTime: 30 * 1000,
  })
}
