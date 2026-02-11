import { ChevronDown, ChevronUp } from "lucide-react"
import { type ReactNode, useLayoutEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/packages/ui/button"
import { cn } from "@/packages/ui-utils"
import type { FilterDefinition } from "../core"
import { DataTableActiveFilters } from "./active-filters"
import { useDataTableConfig } from "./config"
import { useDataTableLayout } from "./context"
import { DataTableFilterBar } from "./filter-bar"
import { DataTableFilterItem, type DataTableFilterLabelMode } from "./filter-item"
import { DataTableSearch, type DataTableSearchProps } from "./search"

export interface DataTableQueryPanelProps<TFilterSchema> {
  className?: string
  actions?: ReactNode
  search?: DataTableSearchProps<TFilterSchema> | false
  quickFilters?: Array<FilterDefinition<TFilterSchema, keyof TFilterSchema>>
  quickFilterLabelMode?: DataTableFilterLabelMode
  quickFilterClassName?: string
  advancedFilters?: Array<FilterDefinition<TFilterSchema, keyof TFilterSchema>>
  activeFilters?: Array<FilterDefinition<TFilterSchema, keyof TFilterSchema>>
  showActiveFilters?: boolean
  expanded?: boolean
  defaultExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  advancedContainerClassName?: string
  advancedFilterBarClassName?: string
}

export function DataTableQueryPanel<TFilterSchema>({
  className,
  actions,
  search,
  quickFilters = [],
  quickFilterLabelMode = "inside",
  quickFilterClassName,
  advancedFilters = [],
  activeFilters,
  showActiveFilters = true,
  expanded: expandedProp,
  defaultExpanded = false,
  onExpandedChange,
  advancedContainerClassName,
  advancedFilterBarClassName,
}: DataTableQueryPanelProps<TFilterSchema>) {
  const { i18n } = useDataTableConfig()
  const layout = useDataTableLayout()
  const stickyQueryPanel = layout?.stickyQueryPanel ?? false
  const isStickyQueryPanel =
    stickyQueryPanel === true || typeof stickyQueryPanel === "object"
  const rootRef = useRef<HTMLDivElement>(null)
  const [expandedState, setExpandedState] = useState(defaultExpanded)
  const expanded = expandedProp ?? expandedState
  const hasAdvancedFilters = advancedFilters.length > 0
  const resolvedActiveFilters = activeFilters ?? advancedFilters

  const setExpanded = (nextExpanded: boolean) => {
    if (expandedProp == null) {
      setExpandedState(nextExpanded)
    }
    onExpandedChange?.(nextExpanded)
  }

  const normalizedSearchProps = useMemo(() => {
    if (search === false) return null
    const base = search ?? {}
    return {
      ...base,
      fullWidth: base.fullWidth ?? false,
      className: cn("min-w-0 flex-1 max-w-md", base.className),
    } satisfies DataTableSearchProps<TFilterSchema>
  }, [search])

  useLayoutEffect(() => {
    const panelElement = rootRef.current
    if (!panelElement) return

    const dataTableRoot = panelElement.closest<HTMLElement>('[data-slot="data-table-root"]')
    if (!dataTableRoot) return

    if (!isStickyQueryPanel) {
      dataTableRoot.style.removeProperty("--dt-sticky-query-height")
      return
    }

    const updateStickyHeight = () => {
      const height = panelElement.offsetHeight
      dataTableRoot.style.setProperty("--dt-sticky-query-height", `${height}px`)
    }

    updateStickyHeight()

    if (typeof ResizeObserver === "undefined") {
      return () => {
        dataTableRoot.style.removeProperty("--dt-sticky-query-height")
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      updateStickyHeight()
    })
    resizeObserver.observe(panelElement)
    window.addEventListener("resize", updateStickyHeight)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", updateStickyHeight)
      dataTableRoot.style.removeProperty("--dt-sticky-query-height")
    }
  }, [isStickyQueryPanel])

  const toggleButton = hasAdvancedFilters ? (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-9 shrink-0 px-2 text-muted-foreground hover:text-foreground"
      onClick={() => setExpanded(!expanded)}
      aria-expanded={expanded}
    >
      {expanded ? i18n.filterBar.collapseText : i18n.filterBar.expandText}
      {expanded ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
    </Button>
  ) : null

  return (
    <div
      ref={rootRef}
      className={cn(
        "border-b border-border/50 bg-card px-3 pt-3 pb-2",
        isStickyQueryPanel && "sticky top-[var(--dt-query-top,var(--dt-sticky-top,0px))] z-20",
        className,
      )}
    >
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {normalizedSearchProps ? (
            <DataTableSearch<TFilterSchema> {...normalizedSearchProps} />
          ) : null}
          {quickFilters.map((filter) => (
            <DataTableFilterItem<TFilterSchema>
              key={String(filter.key)}
              definition={filter}
              labelMode={quickFilterLabelMode}
              className={cn("min-w-30 shrink-0", quickFilterClassName)}
            />
          ))}
          {toggleButton}
        </div>

        {actions ? (
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">{actions}</div>
        ) : null}

        {hasAdvancedFilters && expanded ? (
          <div className={cn("lg:col-span-2", advancedContainerClassName)}>
            <DataTableFilterBar<TFilterSchema>
              filters={advancedFilters}
              activeFilters={resolvedActiveFilters}
              showActiveFilters={false}
              collapsible={false}
              {...(advancedFilterBarClassName ? { className: advancedFilterBarClassName } : {})}
            />
          </div>
        ) : null}
        {showActiveFilters ? (
          <div className="lg:col-span-2">
            <DataTableActiveFilters<TFilterSchema> filters={resolvedActiveFilters} />
          </div>
        ) : null}
      </div>
    </div>
  )
}
