import { GripVertical, RotateCcw, Settings2 } from "lucide-react"
import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { TableColumnCheck } from "../hooks/use-table"

export interface DataTableColumnToggleProps {
	columns: TableColumnCheck[]
	onColumnsChange: (checks: TableColumnCheck[]) => void
	onReset?: (() => void) | undefined
}

export function DataTableColumnToggle({
	columns,
	onColumnsChange,
	onReset,
}: DataTableColumnToggleProps) {
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

	const handleToggle = (key: string) => {
		const updated = columns.map((check) =>
			check.key === key ? { ...check, checked: !check.checked } : check,
		)
		onColumnsChange(updated)
	}

	const handleDragStart = (e: React.DragEvent, index: number) => {
		e.stopPropagation()
		setDraggedIndex(index)
	}

	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault()
		e.stopPropagation()
		setDragOverIndex(index)
	}

	const handleDragEnd = (e: React.DragEvent) => {
		e.stopPropagation()
		if (draggedIndex === null || dragOverIndex === null || draggedIndex === dragOverIndex) {
			setDraggedIndex(null)
			setDragOverIndex(null)
			return
		}

		const reordered = [...columns]
		const draggedItem = reordered[draggedIndex]
		if (!draggedItem) {
			setDraggedIndex(null)
			setDragOverIndex(null)
			return
		}

		reordered.splice(draggedIndex, 1)
		reordered.splice(dragOverIndex, 0, draggedItem)

		onColumnsChange(reordered)
		setDraggedIndex(null)
		setDragOverIndex(null)
	}

	const handleDragLeave = (e: React.DragEvent) => {
		e.stopPropagation()
		setDragOverIndex(null)
	}

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
					{onReset && (
						<Button
							variant="ghost"
							size="sm"
							className="h-7 px-2 text-xs"
							onClick={(e) => {
								e.stopPropagation()
								onReset()
							}}
						>
							<RotateCcw className="mr-1 h-3 w-3" />
							重置
						</Button>
					)}
				</div>
				<DropdownMenuSeparator />
				<div className="max-h-100 overflow-y-auto">
					{columns.map((check, index) => (
						<div
							key={check.key}
							className={cn(
								"flex w-full items-center gap-2 px-2 py-2 hover:bg-accent rounded-sm transition-colors",
								draggedIndex === index && "opacity-50",
								dragOverIndex === index && "border-t-2 border-primary",
							)}
						>
							{/* biome-ignore lint/a11y/noStaticElementInteractions: Drag handle requires event handlers for HTML5 drag API functionality */}
							<div
								draggable
								onDragStart={(e) => handleDragStart(e, index)}
								onDragEnd={handleDragEnd}
								onDragOver={(e) => handleDragOver(e, index)}
								onDragLeave={handleDragLeave}
								className="cursor-move p-1 hover:bg-muted rounded flex items-center justify-center"
								title={`Drag to reorder ${check.title} column`}
							>
								<GripVertical className="h-4 w-4 text-muted-foreground" />
							</div>
							<label
								htmlFor={`column-${check.key}`}
								className="flex flex-1 items-center gap-2 cursor-pointer"
							>
								<Checkbox
									id={`column-${check.key}`}
									checked={check.checked}
									onCheckedChange={() => handleToggle(check.key)}
								/>
								<span className="flex-1 text-sm select-none">{check.title}</span>
							</label>
						</div>
					))}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
