import type { Row } from "@tanstack/react-table"
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useDataTableConfig } from "./config"
import { useDataTableInstance } from "./context"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getIndentSize(meta: unknown): number {
  if (!isRecord(meta)) return 24
  const value = meta.dtTreeIndentSize
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 24
}

export interface DataTableTreeCellProps<TData> {
  row: Row<TData>
  children: ReactNode
  className?: string
}

export function DataTableTreeCell<TData>({
  row,
  children,
  className,
}: DataTableTreeCellProps<TData>) {
  const dt = useDataTableInstance<TData, unknown>()
  const { i18n } = useDataTableConfig()
  const indentSize = getIndentSize(dt.table.options.meta)
  const paddingLeft = row.depth * indentSize
  const isLoading = dt.tree.loadingRowIds.includes(row.id)
  const canExpand = row.getCanExpand()

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)} style={{ paddingLeft }}>
      {canExpand ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={(event) => {
            event.stopPropagation()
            dt.actions.toggleRowExpanded(row.id)
          }}
          disabled={isLoading}
          aria-label={
            row.getIsExpanded() ? i18n.rowExpansion.collapseLabel : i18n.rowExpansion.expandLabel
          }
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      ) : (
        <div className="h-9 w-9" />
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
