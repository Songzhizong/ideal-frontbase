import type { DataTableInstance } from "../../core"
import { DataTableQueryPanel } from "../query/query-panel"
import type { DataTablePresetQueryProps } from "../query/types"
import type { DataTableLayoutOptions, DataTableVariant } from "../table/context"
import { DataTablePagination, type DataTablePaginationProps } from "../table/pagination"
import { DataTableRoot } from "../table/root"
import type { DataTableSelectionBarProps } from "../table/selection-bar"
import { DataTableSelectionBar } from "../table/selection-bar"
import { DataTableTable, type DataTableTableProps } from "../table/table"

export interface DataTablePresetProps<TData, TFilterSchema> {
  dt: DataTableInstance<TData, TFilterSchema>
  height?: string
  className?: string
  layout?: DataTableLayoutOptions
  variant?: DataTableVariant
  query: DataTablePresetQueryProps<TFilterSchema>
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
  variant,
  query,
  table,
  selectionBarActions,
  selectionBarClassName,
  pagination,
}: DataTablePresetProps<TData, TFilterSchema>) {
  const tableRenderSubComponent = table?.renderSubComponent
  const tableRenderEmpty = table?.renderEmpty
  const tableRenderError = table?.renderError
  const paginationClassName = pagination === false ? null : pagination?.className
  const paginationPageSizeOptions = pagination === false ? undefined : pagination?.pageSizeOptions

  return (
    <DataTableRoot
      dt={dt}
      {...(typeof height === "string" ? { height } : {})}
      {...(typeof className === "string" ? { className } : {})}
      {...(layout ? { layout } : {})}
      {...(variant ? { variant } : {})}
    >
      <DataTableQueryPanel<TFilterSchema> {...query} />
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
