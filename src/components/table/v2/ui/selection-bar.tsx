import type { ReactNode } from "react"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  buildSelectionExportPayload,
  type DataTableSelection,
  type DataTableSelectionExportPayload,
} from "../core"
import { type DataTableI18nOverrides, mergeDataTableI18n, useDataTableConfig } from "./config"
import { useDataTableInstance } from "./context"

export interface DataTableSelectionBarProps<TData, TFilterSchema = unknown> {
  className?: string
  actions?: (args: {
    selectedRowIds: string[]
    selectedRowsCurrentPage: TData[]
    mode: "page" | "cross-page"
    selection: DataTableSelection<TData>
    selectionScope: DataTableSelection<TData>["selectionScope"]
    exportPayload: DataTableSelectionExportPayload<TFilterSchema>
  }) => ReactNode
  i18n?: DataTableI18nOverrides
}

export function DataTableSelectionBar<TData, TFilterSchema = unknown>({
  className,
  actions,
  i18n: i18nOverrides,
}: DataTableSelectionBarProps<TData, TFilterSchema>) {
  const dt = useDataTableInstance<TData, TFilterSchema>()
  const { i18n: globalI18n } = useDataTableConfig()

  const i18n = useMemo(() => {
    return mergeDataTableI18n(globalI18n, i18nOverrides)
  }, [globalI18n, i18nOverrides])
  const exportPayload = useMemo<DataTableSelectionExportPayload<TFilterSchema>>(
    () =>
      buildSelectionExportPayload({
        selectionScope: dt.selection.selectionScope,
        filters: dt.filters.state,
      }),
    [dt.selection.selectionScope, dt.filters.state],
  )

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
          selectionScope: dt.selection.selectionScope,
          exportPayload,
        })}
      </div>
    </div>
  )
}
