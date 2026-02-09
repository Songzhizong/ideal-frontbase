import { parseAsString } from "nuqs"
import {
  parseAsLocalDate,
  parseAsLocalDateRange,
  parseAsNumberRange,
  parseAsTriStateBoolean,
  stateUrl,
} from "@/packages/table"

export function useUserManagementTableState() {
  return stateUrl({
    key: "example_users_v2",
    parsers: {
      q: parseAsString.withDefault(""),
      nameKeyword: parseAsString.withDefault(""),
      status: parseAsString,
      role: parseAsString,
      department: parseAsString,
      isOnline: parseAsTriStateBoolean,
      riskScoreRange: parseAsNumberRange,
      createdAtDate: parseAsLocalDate,
      lastLoginRange: parseAsLocalDateRange,
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
