import type { FilterDefinition } from "@/packages/table"
import type { TenantProjectOwnerOption, TenantProjectsTableFilters } from "../types/tenant-projects"
import { TENANT_PROJECT_ENVIRONMENTS } from "../types/tenant-projects"
import { TENANT_PROJECT_COST_RANGE_OPTIONS } from "../utils/tenant-projects-formatters"

export function buildTenantProjectsQuickFilters(
  ownerOptions: readonly TenantProjectOwnerOption[],
): Array<FilterDefinition<TenantProjectsTableFilters, keyof TenantProjectsTableFilters>> {
  return [
    {
      key: "environment",
      label: "环境",
      type: "select",
      placeholder: "全部",
      options: TENANT_PROJECT_ENVIRONMENTS.map((environment) => ({
        label: environment,
        value: environment,
      })),
      alwaysVisible: true,
    },
    {
      key: "ownerId",
      label: "Owner",
      type: "select",
      placeholder: "全部",
      options: ownerOptions.map((owner) => ({
        label: owner.displayName,
        value: owner.userId,
      })),
      alwaysVisible: true,
    },
  ] satisfies Array<FilterDefinition<TenantProjectsTableFilters, keyof TenantProjectsTableFilters>>
}

export function buildTenantProjectsAdvancedFilters(): Array<
  FilterDefinition<TenantProjectsTableFilters, keyof TenantProjectsTableFilters>
> {
  return [
    {
      key: "costRange",
      label: "成本区间",
      type: "select",
      placeholder: "全部",
      options: TENANT_PROJECT_COST_RANGE_OPTIONS.map((option) => ({
        label: option.label,
        value: option.value,
      })),
      defaultVisible: true,
    },
  ] satisfies Array<FilterDefinition<TenantProjectsTableFilters, keyof TenantProjectsTableFilters>>
}

export function buildTenantProjectsActiveFilters(
  quickFilters: Array<
    FilterDefinition<TenantProjectsTableFilters, keyof TenantProjectsTableFilters>
  >,
  advancedFilters: Array<
    FilterDefinition<TenantProjectsTableFilters, keyof TenantProjectsTableFilters>
  >,
) {
  return [
    {
      key: "q",
      label: "搜索",
      type: "text",
    },
    ...quickFilters,
    ...advancedFilters,
  ] satisfies Array<FilterDefinition<TenantProjectsTableFilters, keyof TenantProjectsTableFilters>>
}
