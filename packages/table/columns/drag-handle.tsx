import type { ColumnDef } from "@tanstack/react-table"
import { DataTableDragHandle } from "../ui/drag-handle"

export function dragHandle<TData>(): ColumnDef<TData> {
  return {
    id: "__drag_handle__",
    header: () => null,
    cell: () => <DataTableDragHandle />,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    size: 40,
    minSize: 40,
    maxSize: 40,
  }
}
