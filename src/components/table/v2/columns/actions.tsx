import type { ColumnDef, Row } from "@tanstack/react-table"
import type { ReactNode } from "react"

export function actions<TData>(render: (row: Row<TData>) => ReactNode): ColumnDef<TData> {
	return {
		id: "__actions__",
		header: () => null,
		cell: (ctx) => <div className="flex w-full justify-end gap-2">{render(ctx.row)}</div>,
		enableSorting: false,
		enableHiding: false,
		enableResizing: false,
		size: 80,
		minSize: 80,
		maxSize: 80,
		meta: {
			pinned: "right",
		},
	}
}
