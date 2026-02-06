import "@tanstack/react-table"

declare module "@tanstack/react-table" {
	interface ColumnMeta<TData extends RowData, TValue> {
		label?: string
		className?: string
		headerClassName?: string
		cellClassName?: string
		sortable?: boolean
		filterable?: boolean
		filterKey?: string
		hideable?: boolean
		resizable?: boolean
		pinned?: "left" | "right" | false
		headerLabel?: string
	}
}
