import { parseAsString } from "nuqs"
import { stateUrl } from "@/packages/table"

export function useTenantUsersTableState(tenantId: string) {
  return stateUrl({
    key: `infera_tenant_users_${tenantId}`,
    parsers: {
      q: parseAsString.withDefault(""),
      role: parseAsString,
      status: parseAsString,
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
