import { parseAsString, parseAsStringLiteral } from "nuqs"
import { stateUrl } from "@/packages/table"
import { TENANT_USER_ROLES, TENANT_USER_STATUSES } from "../types/tenant-users"

export function useTenantUsersTableState(tenantId: string) {
  return stateUrl({
    key: `infera_tenant_users_${tenantId}`,
    parsers: {
      q: parseAsString.withDefault(""),
      role: parseAsStringLiteral(TENANT_USER_ROLES),
      status: parseAsStringLiteral(TENANT_USER_STATUSES),
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
