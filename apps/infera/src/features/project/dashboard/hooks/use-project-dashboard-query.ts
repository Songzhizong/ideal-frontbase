import { useQuery } from "@tanstack/react-query"
import { type GetProjectDashboardInput, getProjectDashboard } from "../api"

export function getProjectDashboardQueryKey(input: {
  tenantId: string
  projectId: string
  range: GetProjectDashboardInput["range"]
}) {
  return ["infera", "project", "dashboard", input.tenantId, input.projectId, input.range] as const
}

export function useProjectDashboardQuery(input: GetProjectDashboardInput) {
  const range = input.range ?? "24h"

  return useQuery({
    queryKey: getProjectDashboardQueryKey({
      tenantId: input.tenantId,
      projectId: input.projectId,
      range,
    }),
    queryFn: () =>
      getProjectDashboard({
        tenantId: input.tenantId,
        projectId: input.projectId,
        range,
      }),
    enabled: input.tenantId.length > 0 && input.projectId.length > 0,
    staleTime: 45 * 1000,
  })
}
