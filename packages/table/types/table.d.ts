import "@tanstack/react-table"

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string
    className?: string
    headerClassName?: string
    cellClassName?: string
    align?: "left" | "center" | "right"
    headerAlign?: "left" | "center" | "right"
    cellAlign?: "left" | "center" | "right"
    sortable?: boolean
    filterable?: boolean
    filterKey?: string
    hideable?: boolean
    resizable?: boolean
    pinned?: "left" | "right" | false
    headerLabel?: string
  }
}
