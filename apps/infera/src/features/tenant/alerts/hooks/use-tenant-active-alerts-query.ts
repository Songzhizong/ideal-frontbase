import { keepPreviousData, useQuery } from "@tanstack/react-query"
import {
  type GetTenantActiveAlertsInput,
  getTenantActiveAlerts,
} from "../api/get-tenant-active-alerts"

export function useTenantActiveAlertsQuery(input: GetTenantActiveAlertsInput) {
  return useQuery({
    queryKey: ["infera", "tenant", "alerts", input.tenantId, "active", input.status, input.type],
    queryFn: () => getTenantActiveAlerts(input),
    enabled: input.tenantId.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 20 * 1000,
  })
}
