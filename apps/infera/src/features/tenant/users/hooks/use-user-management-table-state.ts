import { parseAsString, parseAsStringLiteral } from "nuqs"
import { stateUrl } from "@/packages/table"
import type { UserManagementTableFilters } from "../types/user-management"

const USER_BOOLEAN_FILTER_VALUES = ["", "true", "false"] as const

export function useUserManagementTableState(tenantId: string) {
  return stateUrl({
    key: `infera_user_management_${tenantId}`,
    parsers: {
      keyword: parseAsString.withDefault(""),
      blocked: parseAsStringLiteral(USER_BOOLEAN_FILTER_VALUES).withDefault(""),
      mfaEnabled: parseAsStringLiteral(USER_BOOLEAN_FILTER_VALUES).withDefault(""),
    },
    defaults: {
      keyword: "",
      blocked: "",
      mfaEnabled: "",
    } satisfies UserManagementTableFilters,
    pagination: {
      defaultPage: 1,
      defaultSize: 20,
    },
    behavior: {
      searchKey: "keyword",
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
