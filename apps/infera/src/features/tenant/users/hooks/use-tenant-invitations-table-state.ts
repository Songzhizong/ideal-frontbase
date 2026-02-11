import { parseAsString } from "nuqs"
import { stateUrl } from "@/packages/table"

export function useTenantInvitationsTableState(tenantId: string) {
  return stateUrl({
    key: `infera_tenant_invitations_${tenantId}`,
    parsers: {
      q: parseAsString.withDefault(""),
    },
    pagination: {
      defaultPage: 1,
      defaultSize: 20,
    },
    behavior: {
      searchKey: "q",
      resetPageOnFilterChange: true,
      resetPageOnSearchChange: true,
      historyByReason: {
        filters: "replace",
        page: "push",
        size: "push",
        sort: "push",
      },
    },
  })
}
