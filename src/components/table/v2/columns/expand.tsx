import type { ColumnDef } from "@tanstack/react-table"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function expand<TData>(): ColumnDef<TData> {
	return {
		id: "__expand__",
		header: () => null,
		cell: ({ row }) => {
			if (!row.getCanExpand()) {
				return <div className="h-9 w-9" />
			}
			return (
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="h-9 w-9"
					onClick={(event) => {
						event.stopPropagation()
						row.toggleExpanded()
					}}
					aria-label={row.getIsExpanded() ? "收起" : "展开"}
				>
					{row.getIsExpanded() ? (
						<ChevronDown className="h-4 w-4" />
					) : (
						<ChevronRight className="h-4 w-4" />
					)}
				</Button>
			)
		},
		enableSorting: false,
		enableHiding: false,
		enableResizing: false,
		size: 40,
		minSize: 40,
		maxSize: 40,
	}
}
