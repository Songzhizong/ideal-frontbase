import { ChevronDown, ChevronUp } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/packages/ui/button"
import { cn } from "@/packages/ui-utils"
import type { FilterDefinition } from "../core"
import { DataTableActiveFilters } from "./active-filters"
import { useDataTableConfig } from "./config"
import { DataTableFilterItem, type DataTableFilterLabelMode } from "./filter-item"

function buildCollapsedFilters<TFilterSchema>(
  filters: Array<FilterDefinition<TFilterSchema, keyof TFilterSchema>>,
  maxVisible: number,
) {
  const alwaysVisible = filters.filter((filter) => filter.alwaysVisible)
  const rest = filters.filter((filter) => !filter.alwaysVisible)
  const preferred = rest.filter((filter) => filter.defaultVisible)
  const remaining = rest.filter((filter) => !filter.defaultVisible)

  const limit = Math.max(maxVisible, alwaysVisible.length)
  const collapsed: Array<FilterDefinition<TFilterSchema, keyof TFilterSchema>> = [...alwaysVisible]

  for (const filter of [...preferred, ...remaining]) {
    if (collapsed.length >= limit) break
    collapsed.push(filter)
  }

  return collapsed
}

export interface DataTableFilterBarProps<TFilterSchema> {
  filters: Array<FilterDefinition<TFilterSchema, keyof TFilterSchema>>
  activeFilters?: Array<FilterDefinition<TFilterSchema, keyof TFilterSchema>>
  showActiveFilters?: boolean
  collapsible?: boolean
  maxVisible?: number
  labelMode?: DataTableFilterLabelMode
  showItemClearButtons?: boolean
  className?: string
}

export function DataTableFilterBar<TFilterSchema>({
  filters,
  activeFilters,
  showActiveFilters = true,
  collapsible = true,
  maxVisible = 3,
  labelMode = "top",
  showItemClearButtons,
  className,
}: DataTableFilterBarProps<TFilterSchema>) {
  const { i18n } = useDataTableConfig()
  const [expanded, setExpanded] = useState(!collapsible)

  const collapsedFilters = useMemo(
    () => buildCollapsedFilters(filters, maxVisible),
    [filters, maxVisible],
  )

  const shouldCollapse = collapsible && collapsedFilters.length < filters.length
  const visibleFilters = expanded || !shouldCollapse ? filters : collapsedFilters
  const resolvedShowItemClearButtons = showItemClearButtons ?? !showActiveFilters

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-end gap-3">
        {visibleFilters.map((filter) => (
          <DataTableFilterItem
            key={String(filter.key)}
            definition={filter}
            className="min-w-45"
            labelMode={labelMode}
            showClearButton={resolvedShowItemClearButtons}
          />
        ))}
        {shouldCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((prev) => !prev)}
            className="h-9 px-2 text-muted-foreground hover:text-foreground"
          >
            {expanded ? i18n.filterBar.collapseText : i18n.filterBar.expandText}
            {expanded ? (
              <ChevronUp className="ml-1 h-4 w-4" />
            ) : (
              <ChevronDown className="ml-1 h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      {showActiveFilters && <DataTableActiveFilters filters={activeFilters ?? filters} />}
    </div>
  )
}
