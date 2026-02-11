import type { FilterDefinition } from "../core"
import type { DataTablePresetQueryProps } from "./preset"
import type { DataTableSearchProps } from "./search"

function mergeFilterDefinitions<TFilterSchema>(
  quickFilters: Array<FilterDefinition<TFilterSchema, keyof TFilterSchema>>,
  advancedFilters: Array<FilterDefinition<TFilterSchema, keyof TFilterSchema>>,
): Array<FilterDefinition<TFilterSchema, keyof TFilterSchema>> {
  const merged = [...quickFilters, ...advancedFilters]
  const seenKeys = new Set<string>()
  const next: Array<FilterDefinition<TFilterSchema, keyof TFilterSchema>> = []

  for (const filter of merged) {
    const key = String(filter.key)
    if (seenKeys.has(key)) continue
    seenKeys.add(key)
    next.push(filter)
  }

  return next
}

export interface CrudQueryPresetOptions<TFilterSchema>
  extends Omit<DataTablePresetQueryProps<TFilterSchema>, "search" | "activeFilters"> {
  search?: DataTableSearchProps<TFilterSchema> | false
  activeFilters?: Array<FilterDefinition<TFilterSchema, keyof TFilterSchema>>
}

export function createCrudQueryPreset<TFilterSchema>(
  options: CrudQueryPresetOptions<TFilterSchema> = {},
): DataTablePresetQueryProps<TFilterSchema> {
  const {
    search = {},
    quickFilters = [],
    advancedFilters = [],
    activeFilters,
    showActiveFilters = true,
    ...rest
  } = options

  const resolvedActiveFilters =
    activeFilters ?? mergeFilterDefinitions(quickFilters, advancedFilters)

  return {
    search,
    quickFilters,
    advancedFilters,
    activeFilters: resolvedActiveFilters,
    showActiveFilters,
    ...rest,
  }
}
