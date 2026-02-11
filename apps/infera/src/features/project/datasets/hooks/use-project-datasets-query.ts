import { useQuery } from "@tanstack/react-query"
import { getProjectDatasets } from "../api"
import type { DatasetFilterState } from "../types/project-datasets"

export function getProjectDatasetsQueryKey(
  tenantId: string,
  projectId: string,
  filters: DatasetFilterState,
) {
  return [
    "infera",
    "project",
    "datasets",
    tenantId,
    projectId,
    filters.q,
    filters.onlyUsed,
    filters.minRows,
    filters.maxRows,
  ] as const
}

export function useProjectDatasetsQuery(
  tenantId: string,
  projectId: string,
  filters: DatasetFilterState,
) {
  return useQuery({
    queryKey: getProjectDatasetsQueryKey(tenantId, projectId, filters),
    queryFn: () => getProjectDatasets(tenantId, projectId, filters),
    enabled: tenantId.length > 0 && projectId.length > 0,
    staleTime: 30 * 1000,
  })
}
