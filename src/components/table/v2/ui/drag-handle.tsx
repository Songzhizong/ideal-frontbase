import { GripVertical } from "lucide-react"
import type { ReactNode } from "react"
import { createContext, useContext } from "react"
import { cn } from "@/lib/utils"
import { useDataTableConfig } from "./config"

export interface DataTableDragSortRowContextValue {
	handle: boolean
	isDragging: boolean
	setActivatorNodeRef: (element: HTMLElement | null) => void
	attributes: Record<string, unknown>
	listeners: Record<string, unknown>
}

const DataTableDragSortRowContext = createContext<DataTableDragSortRowContextValue | null>(null)

export function DataTableDragSortRowProvider({
	value,
	children,
}: {
	value: DataTableDragSortRowContextValue
	children: ReactNode
}) {
	return (
		<DataTableDragSortRowContext.Provider value={value}>
			{children}
		</DataTableDragSortRowContext.Provider>
	)
}

export function useDataTableDragSortRow() {
	return useContext(DataTableDragSortRowContext)
}

export interface DataTableDragHandleProps {
	className?: string
}

export function DataTableDragHandle({ className }: DataTableDragHandleProps) {
	const ctx = useDataTableDragSortRow()
	const { i18n } = useDataTableConfig()
	const icon = <GripVertical className="h-4 w-4 text-muted-foreground" />

	if (!ctx) {
		return <div className={cn("flex h-9 w-9 items-center justify-center", className)}>{icon}</div>
	}

	if (!ctx.handle) {
		return (
			<div className={cn("flex h-9 w-9 items-center justify-center cursor-grab", className)}>
				{icon}
			</div>
		)
	}

	return (
		<button
			type="button"
			ref={ctx.setActivatorNodeRef}
			className={cn(
				"flex h-9 w-9 items-center justify-center cursor-grab rounded-md hover:bg-accent",
				ctx.isDragging && "cursor-grabbing",
				className,
			)}
			aria-label={i18n.dragSort.handleLabel}
			{...ctx.attributes}
			{...ctx.listeners}
		>
			{icon}
		</button>
	)
}
