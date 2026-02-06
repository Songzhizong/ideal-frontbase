import type { ReactNode } from "react"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { DataTableSelection } from "../core"
import { type DataTableI18nOverrides, useDataTableConfig } from "./config"
import { useDataTableInstance } from "./context"

export interface DataTableSelectionBarProps<TData> {
	className?: string
	actions?: (args: {
		selectedRowIds: string[]
		selectedRowsCurrentPage: TData[]
		mode: "page" | "cross-page"
		selection: DataTableSelection<TData>
	}) => ReactNode
	i18n?: DataTableI18nOverrides
}

export function DataTableSelectionBar<TData>({
	className,
	actions,
	i18n: i18nOverrides,
}: DataTableSelectionBarProps<TData>) {
	const dt = useDataTableInstance<TData, unknown>()
	const { i18n: globalI18n } = useDataTableConfig()

	const i18n = useMemo(() => {
		return {
			...globalI18n,
			...i18nOverrides,
			selectionBar: {
				...globalI18n.selectionBar,
				...i18nOverrides?.selectionBar,
			},
			pagination: {
				...globalI18n.pagination,
				...i18nOverrides?.pagination,
			},
		}
	}, [globalI18n, i18nOverrides])

	if (!dt.selection.enabled) return null

	const show =
		dt.selection.mode === "cross-page"
			? Boolean(dt.selection.crossPage?.isAllSelected) || dt.selection.selectedRowIds.length > 0
			: dt.selection.selectedRowIds.length > 0
	if (!show) return null

	const count =
		dt.selection.mode === "cross-page" && dt.selection.crossPage
			? dt.selection.crossPage.totalSelected
			: dt.selection.selectedRowIds.length

	const canUpgrade =
		dt.selection.mode === "cross-page" &&
		dt.selection.crossPage &&
		!dt.selection.crossPage.isAllSelected
	const canRollback =
		dt.selection.mode === "cross-page" &&
		dt.selection.crossPage &&
		dt.selection.crossPage.isAllSelected

	return (
		<div
			className={cn(
				"flex w-full flex-col gap-2 border-t border-border/50 bg-background px-3 py-2 sm:flex-row sm:items-center sm:justify-between",
				className,
			)}
		>
			<div className="text-sm text-muted-foreground">{i18n.selectionBar.selected(count)}</div>
			<div className="flex flex-wrap items-center gap-2">
				{canUpgrade && (
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="h-8"
						onClick={() => void dt.actions.selectAllMatching()}
					>
						{i18n.selectionBar.selectAllMatching(dt.pagination.total)}
					</Button>
				)}
				{canRollback && (
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="h-8"
						onClick={() => {
							dt.actions.clearSelection()
							dt.actions.selectAllCurrentPage()
						}}
					>
						{i18n.selectionBar.backToPage}
					</Button>
				)}
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="h-8"
					onClick={() => dt.actions.clearSelection()}
				>
					{i18n.selectionBar.clear}
				</Button>
				{actions?.({
					selectedRowIds: dt.selection.selectedRowIds,
					selectedRowsCurrentPage: dt.selection.selectedRowsCurrentPage,
					mode: dt.selection.mode,
					selection: dt.selection,
				})}
			</div>
		</div>
	)
}
