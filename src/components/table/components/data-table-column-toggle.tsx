import type { Table } from "@tanstack/react-table"
import { Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface DataTableColumnToggleProps<TData = unknown> {
	/**
	 * TanStack Table instance (single source of truth)
	 */
	table: Table<TData>
}

/**
 * Column visibility toggle component
 * Operates directly on table instance - no separate state management needed
 */
export function DataTableColumnToggle<TData>({ table }: DataTableColumnToggleProps<TData>) {
	// Get all columns that can be hidden
	const columns = table
		.getAllColumns()
		.filter((column) => column.getCanHide() && column.id !== "select" && column.id !== "actions")

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="ml-auto h-8">
					<Settings2 className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-60">
				<div className="flex items-center justify-between px-2 py-1.5">
					<DropdownMenuLabel className="p-0">列设置</DropdownMenuLabel>
				</div>
				<DropdownMenuSeparator />
				<div className="max-h-100 overflow-y-auto">
					{columns.map((column) => {
						const columnDef = column.columnDef
						const label =
							(columnDef.meta as { label?: string })?.label ||
							(typeof columnDef.header === "string" ? columnDef.header : column.id)

						return (
							<div
								key={column.id}
								className="flex w-full items-center gap-2 px-2 py-2 hover:bg-accent rounded-sm transition-colors"
							>
								<label
									htmlFor={`column-${column.id}`}
									className="flex flex-1 items-center gap-2 cursor-pointer"
								>
									<Checkbox
										id={`column-${column.id}`}
										checked={column.getIsVisible()}
										onCheckedChange={(value) => column.toggleVisibility(!!value)}
									/>
									<span className="flex-1 text-sm select-none">{label}</span>
								</label>
							</div>
						)
					})}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
