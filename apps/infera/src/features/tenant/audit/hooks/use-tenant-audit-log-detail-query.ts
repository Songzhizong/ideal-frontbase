import { useQuery } from "@tanstack/react-query"
import { type GetTenantAuditLogDetailInput, getTenantAuditLogDetail } from "../api"

export function useTenantAuditLogDetailQuery(
  input: GetTenantAuditLogDetailInput,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["tenant", "audit", "log-detail", input.tenantId, input.logId],
    queryFn: () => getTenantAuditLogDetail(input),
    enabled: enabled && input.tenantId.length > 0 && input.logId.length > 0,
    staleTime: 30 * 1000,
  })
}
