import { keepPreviousData, useQuery } from "@tanstack/react-query"
import {
  type GetTenantAlertHistoryInput,
  getTenantAlertHistory,
} from "../api/get-tenant-alert-history"

export function useTenantAlertHistoryQuery(input: GetTenantAlertHistoryInput) {
  return useQuery({
    queryKey: [
      "infera",
      "tenant",
      "alerts",
      input.tenantId,
      "history",
      input.event,
      input.type,
      input.status,
    ],
    queryFn: () => getTenantAlertHistory(input),
    enabled: input.tenantId.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 20 * 1000,
  })
}
