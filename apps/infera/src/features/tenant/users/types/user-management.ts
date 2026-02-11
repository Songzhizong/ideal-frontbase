export type UserBooleanFilter = "" | "true" | "false"

export interface UserManagementTableFilters {
  keyword: string
  blocked: UserBooleanFilter
  mfaEnabled: UserBooleanFilter
}
