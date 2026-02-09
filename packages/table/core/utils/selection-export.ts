import type { DataTableSelectionScope } from "../types"

export type DataTableSelectionExportPayload<TFilterSchema> =
  | {
      type: "ids"
      rowIds: string[]
    }
  | {
      type: "all"
      excludedRowIds: string[]
      filters: TFilterSchema
    }

export function buildSelectionExportPayload<TFilterSchema>(args: {
  selectionScope: DataTableSelectionScope
  filters: TFilterSchema
}): DataTableSelectionExportPayload<TFilterSchema> {
  if (args.selectionScope.type === "all") {
    return {
      type: "all",
      excludedRowIds: args.selectionScope.excludedRowIds,
      filters: args.filters,
    }
  }

  return {
    type: "ids",
    rowIds: args.selectionScope.rowIds,
  }
}
