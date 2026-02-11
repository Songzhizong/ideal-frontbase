import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { type GetTenantAuditLogsInput, getTenantAuditLogs } from "../api"

export function useTenantAuditLogsQuery(input: GetTenantAuditLogsInput) {
  const page = input.page ?? 1
  const size = input.size ?? 20

  return useQuery({
    queryKey: [
      "tenant",
      "audit",
      "logs",
      input.tenantId,
      page,
      size,
      input.filters.actorType,
      input.filters.actorQuery,
      input.filters.action,
      input.filters.resourceType,
      input.filters.projectId,
      input.filters.startTimeMs,
      input.filters.endTimeMs,
    ],
    queryFn: () =>
      getTenantAuditLogs({
        ...input,
        page,
        size,
      }),
    enabled: input.tenantId.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  })
}
