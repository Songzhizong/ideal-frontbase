import { parseAsString } from "nuqs"
import {
  parseAsLocalDate,
  parseAsLocalDateRange,
  parseAsNumberRange,
  parseAsTriStateBoolean,
  stateUrl,
} from "@/components/table/v2"

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
  })
}
