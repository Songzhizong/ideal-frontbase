import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import type { DataTableInstance } from "../core"
import type { DataTableActiveFiltersProps } from "./active-filters"
import { DataTableActiveFilters } from "./active-filters"
import type { DataTableLayoutOptions } from "./context"
import type { DataTableFilterBarProps } from "./filter-bar"
import { DataTableFilterBar } from "./filter-bar"
import { DataTablePagination, type DataTablePaginationProps } from "./pagination"
import { DataTableQueryPanel, type DataTableQueryPanelProps } from "./query-panel"
import { DataTableRoot } from "./root"
import { DataTableSearch, type DataTableSearchProps } from "./search"
import type { DataTableSelectionBarProps } from "./selection-bar"
import { DataTableSelectionBar } from "./selection-bar"
import { DataTableTable, type DataTableTableProps } from "./table"
import { DataTableToolbar, type DataTableToolbarProps } from "./toolbar"

export interface DataTablePresetProps<TData, TFilterSchema> {
  dt: DataTableInstance<TData, TFilterSchema>
  height?: string
  className?: string
  layout?: DataTableLayoutOptions
  toolbar?: ReactNode
  toolbarActions?: DataTableToolbarProps["actions"]
  toolbarClassName?: string
  query?: DataTableQueryPanelProps<TFilterSchema>
  search?: DataTableSearchProps<TFilterSchema> | false
  filterBar?: DataTableFilterBarProps<TFilterSchema>
  filterBarContainerClassName?: string
  activeFilters?: DataTableActiveFiltersProps<TFilterSchema>
  activeFiltersContainerClassName?: string
  renderEmpty?: () => ReactNode
  renderError?: (error: unknown, retry?: () => void | Promise<void>) => ReactNode
  table?: Pick<DataTableTableProps<TData>, "renderSubComponent" | "renderEmpty" | "renderError">
  selectionBarActions?: DataTableSelectionBarProps<TData, TFilterSchema>["actions"]
  selectionBarClassName?: string
  pagination?: DataTablePaginationProps | false
}

export function DataTablePreset<TData, TFilterSchema>({
  dt,
  height,
  className,
  layout,
  toolbar,
  toolbarActions,
  toolbarClassName,
  query,
  search,
  filterBar,
  filterBarContainerClassName,
  activeFilters,
  activeFiltersContainerClassName,
  renderEmpty,
  renderError,
  table,
  selectionBarActions,
  selectionBarClassName,
  pagination,
}: DataTablePresetProps<TData, TFilterSchema>) {
  const toolbarContent =
    toolbar === undefined ? (
      search === false ? null : (
        <DataTableSearch<TFilterSchema> {...(search ?? {})} />
      )
    ) : (
      toolbar
    )
  const shouldShowToolbar = toolbarContent !== null || toolbarActions != null
  const tableRenderSubComponent = table?.renderSubComponent
  const tableRenderEmpty = table?.renderEmpty ?? renderEmpty
  const tableRenderError = table?.renderError ?? renderError
  const paginationClassName = pagination === false ? null : pagination?.className
  const paginationPageSizeOptions = pagination === false ? undefined : pagination?.pageSizeOptions
  const activeFiltersClassName = activeFilters
    ? cn(
        "border-b border-border/50 bg-muted/20 px-3 py-3",
        activeFiltersContainerClassName,
        activeFilters.className,
      )
    : undefined

  return (
    <DataTableRoot
      dt={dt}
      {...(typeof height === "string" ? { height } : {})}
      {...(typeof className === "string" ? { className } : {})}
      {...(layout ? { layout } : {})}
    >
      {query ? (
        <DataTableQueryPanel<TFilterSchema> {...query} />
      ) : (
        <>
          {shouldShowToolbar ? (
            <DataTableToolbar
              {...(toolbarClassName ? { className: toolbarClassName } : {})}
              actions={toolbarActions}
            >
              {toolbarContent}
            </DataTableToolbar>
          ) : null}
          {filterBar ? (
            <div
              className={cn(
                "border-b border-border/50 bg-background px-3 py-3",
                filterBarContainerClassName,
              )}
            >
              <DataTableFilterBar<TFilterSchema> {...filterBar} />
            </div>
          ) : null}
          {activeFilters ? (
            <DataTableActiveFilters<TFilterSchema>
              {...activeFilters}
              {...(activeFiltersClassName ? { className: activeFiltersClassName } : {})}
            />
          ) : null}
        </>
      )}
      <DataTableTable<TData>
        {...(tableRenderSubComponent ? { renderSubComponent: tableRenderSubComponent } : {})}
        {...(tableRenderEmpty ? { renderEmpty: tableRenderEmpty } : {})}
        {...(tableRenderError ? { renderError: tableRenderError } : {})}
      />
      <DataTableSelectionBar<TData, TFilterSchema>
        {...(selectionBarClassName ? { className: selectionBarClassName } : {})}
        {...(selectionBarActions ? { actions: selectionBarActions } : {})}
      />
      {pagination === false ? null : (
        <DataTablePagination
          {...(paginationClassName ? { className: paginationClassName } : {})}
          {...(paginationPageSizeOptions !== undefined
            ? { pageSizeOptions: paginationPageSizeOptions }
            : {})}
          {...(pagination && pagination.showTotal === false ? { showTotal: false } : {})}
          {...(pagination?.i18n ? { i18n: pagination.i18n } : {})}
        />
      )}
    </DataTableRoot>
  )
}
