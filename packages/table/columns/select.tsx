import type { ColumnDef, Row, Table } from "@tanstack/react-table"
import { Checkbox } from "@/packages/ui/checkbox"
import { useDataTableConfig } from "../ui/config/provider"

function SelectAllCheckbox<TData>({ table }: { table: Table<TData> }) {
  const { i18n } = useDataTableConfig()
  return (
    <Checkbox
      checked={
        table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
      }
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(Boolean(value))}
      aria-label={i18n.selectionCheckboxLabel}
    />
  )
}

function RowCheckbox<TData>({ row }: { row: Row<TData> }) {
  const { i18n } = useDataTableConfig()
  return (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
      aria-label={i18n.selectionCheckboxLabel}
    />
  )
}

export function select<TData>(): ColumnDef<TData> {
  return {
    id: "__select__",
    header: ({ table }) => <SelectAllCheckbox table={table} />,
    cell: ({ row }) => <RowCheckbox row={row} />,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    size: 40,
    minSize: 40,
    maxSize: 40,
  }
}
