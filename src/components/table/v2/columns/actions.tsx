import type { ColumnDef, Row } from "@tanstack/react-table"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type DataTableActionsColumnAlign = "left" | "center" | "right"

export interface DataTableActionsColumnOptions<TData> {
  header?: ColumnDef<TData>["header"]
  size?: number
  minSize?: number
  maxSize?: number
  align?: DataTableActionsColumnAlign
  headerClassName?: string
  cellClassName?: string
}

export function actions<TData>(
  render: (row: Row<TData>) => ReactNode,
  options?: DataTableActionsColumnOptions<TData>,
): ColumnDef<TData> {
  const size = options?.size ?? 80
  const minSize = options?.minSize ?? size
  const maxSize = options?.maxSize ?? size
  const align = options?.align ?? "right"
  const justifyClassName =
    align === "center" ? "justify-center" : align === "left" ? "justify-start" : "justify-end"
  const headerClassName = cn(options?.headerClassName)

  return {
    id: "__actions__",
    header: options?.header ?? (() => null),
    cell: (ctx) => (
      <div className={cn("flex w-full gap-2", justifyClassName)}>{render(ctx.row)}</div>
    ),
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    size,
    minSize,
    maxSize,
    meta: {
      pinned: "right",
      headerAlign: align,
      cellAlign: align,
      ...(headerClassName ? { headerClassName } : {}),
      ...(options?.cellClassName ? { cellClassName: options.cellClassName } : {}),
    },
  }
}
