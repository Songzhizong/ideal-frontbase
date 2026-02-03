import { flexRender, type Table as TanStackTable } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import type React from "react"
import { type ReactNode, useContext, useRef } from "react"
import { TableContext, type TableContextValue } from "@/components/table/context/table-context"
import { Button } from "@/components/ui/button"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export interface DataTableProps<TData> {
	/**
	 * TanStack Table instance (required)
	 */
	table: TanStackTable<TData>
	/**
	 * Loading state
	 */
	loading: boolean
	/**
	 * Fetching state (for refresh)
	 */
	fetching?: boolean
	/**
	 * Empty state
	 */
	empty: boolean
	/**
	 * Empty text
	 */
	emptyText: string
	/**
	 * Additional class names
	 */
	className?: string
	/**
	 * Optional max height for internal scroll area (enables body scrolling)
	 */
	maxHeight?: string | undefined
	/**
	 * Custom empty state component
	 */
	emptyState?: ReactNode
	/**
	 * Custom loading state component
	 */
	loadingState?: ReactNode
}

export interface DataTableContentProps<TData> extends Partial<DataTableProps<TData>> {
	table: TanStackTable<TData>
}

/**
 * Pure rendering component for TanStack Table.
 * It uses the table instance to render the header and body.
 * Performance optimized with sticky header support and scroll synchronization.
 */
export function DataTableContent<TData>({
	table,
	loading: propLoading,
	fetching: propFetching,
	empty: propEmpty,
	emptyText: propEmptyText,
	className,
	maxHeight,
	emptyState: propEmptyState,
	loadingState: propLoadingState,
}: DataTableContentProps<TData>) {
	// Try to get values from context if they are available
	// We use useContext directly instead of useTableContext to avoid throwing error
	// when DataTable is used outside of TableProvider.
	const context = useContext(TableContext) as TableContextValue<TData> | null
	const loading = propLoading ?? context?.loading ?? false
	const fetching = propFetching ?? false
	const empty = propEmpty ?? context?.empty ?? false
	const emptyText = propEmptyText ?? "暂无数据"
	const emptyState = propEmptyState ?? context?.emptyState
	const loadingState = propLoadingState ?? context?.loadingState

	const totalColumns = table.getAllColumns().length
	const headerRef = useRef<HTMLDivElement>(null)
	const bodyRef = useRef<HTMLDivElement>(null)

	const tableBodyWrapperClassName = cn(
		"flex-1 min-h-0 w-full overflow-x-auto",
		maxHeight && "overflow-y-auto",
	)

	const handleBodyScroll = (e: React.UIEvent<HTMLDivElement>) => {
		if (headerRef.current) {
			headerRef.current.scrollLeft = e.currentTarget.scrollLeft
		}
	}

	// Default loading state
	const defaultLoadingState = (
		<TableRow>
			<TableCell colSpan={totalColumns} className="h-24 text-center">
				<div className="flex items-center justify-center">
					<div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					<span className="ml-2 text-muted-foreground">加载中...</span>
				</div>
			</TableCell>
		</TableRow>
	)

	// Default empty state
	const defaultEmptyState = (
		<TableRow>
			<TableCell colSpan={totalColumns} className="h-24 text-center text-muted-foreground">
				{emptyText}
			</TableCell>
		</TableRow>
	)

	return (
		<div className={cn("relative flex w-full flex-1 min-h-0 flex-col", className)}>
			{fetching && !loading && (
				<div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-sm">
					<div className="flex items-center gap-2 rounded-lg bg-card px-4 py-3 shadow-lg border border-border">
						<div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
						<span className="text-sm text-foreground">刷新中...</span>
					</div>
				</div>
			)}

			<div
				ref={headerRef}
				className="sticky top-(--data-table-sticky-offset,0px) z-10 overflow-hidden border-b border-table-border bg-table-header"
			>
				<Table className="table-fixed">
					<TableHeader className="bg-transparent border-none shadow-none [&_tr]:border-b-0">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
								{headerGroup.headers.map((header) => {
									const canSort = header.column.getCanSort()
									const isSorted = header.column.getIsSorted()
									const size = header.getSize()
									const align = (
										header.column.columnDef.meta as { align?: "left" | "center" | "right" }
									)?.align

									return (
										<TableHead
											key={header.id}
											style={{
												width: `${size}px`,
												minWidth: `${size}px`,
											}}
											className={cn(
												align === "center" && "text-center",
												align === "right" && "text-right",
											)}
										>
											{header.isPlaceholder ? null : canSort ? (
												<Button
													variant="ghost"
													size="sm"
													className="px-0 h-8 data-[state=open]:bg-accent"
													onClick={() => header.column.toggleSorting()}
												>
													{flexRender(header.column.columnDef.header, header.getContext())}
													{isSorted === "desc" ? (
														<ArrowDown className="ml-2 h-4 w-4" />
													) : isSorted === "asc" ? (
														<ArrowUp className="ml-2 h-4 w-4" />
													) : (
														<ArrowUpDown className="ml-2 h-4 w-4" />
													)}
												</Button>
											) : (
												flexRender(header.column.columnDef.header, header.getContext())
											)}
										</TableHead>
									)
								})}
							</TableRow>
						))}
					</TableHeader>
				</Table>
			</div>

			<div
				ref={bodyRef}
				onScroll={handleBodyScroll}
				className={tableBodyWrapperClassName}
				style={maxHeight ? { maxHeight } : undefined}
			>
				<Table className="table-fixed">
					<TableBody>
						{loading
							? loadingState || defaultLoadingState
							: empty || table.getRowModel().rows?.length === 0
								? emptyState || defaultEmptyState
								: table.getRowModel().rows.map((row) => (
										<TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
											{row.getVisibleCells().map((cell) => {
												const size = cell.column.getSize()
												const align = (
													cell.column.columnDef.meta as {
														align?: "left" | "center" | "right"
													}
												)?.align
												return (
													<TableCell
														key={cell.id}
														style={{
															width: `${size}px`,
															minWidth: `${size}px`,
														}}
														className={cn(
															align === "center" && "text-center",
															align === "right" && "text-right",
														)}
													>
														{flexRender(cell.column.columnDef.cell, cell.getContext())}
													</TableCell>
												)
											})}
										</TableRow>
									))}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}

/**
 * Main Table Component.
 * Now requires a table instance, promoting a single source of truth.
 */
export function DataTable<TData>(props: DataTableProps<TData>) {
	return <DataTableContent {...props} />
}
