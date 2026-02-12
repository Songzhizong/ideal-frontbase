import { type CSSProperties, type ReactNode, useMemo } from "react"
import { cn } from "@/packages/ui-utils"
import type { DataTableInstance } from "../core"
import { type DataTableLayoutOptions, DataTableProvider, type DataTableVariant } from "./context"

interface DataTableVariantCssVariables {
  headerForeground: string
  rowHoverBackground: string
  rowSelectedBackground: string
  headHeight: string
  cellPaddingX: string
  cellPaddingYBase: string
  cellPaddingYCompact: string
  cellPaddingYComfortable: string
}

const DATA_TABLE_VARIANT_CSS_VARIABLES: Readonly<
  Record<DataTableVariant, DataTableVariantCssVariables>
> = {
  default: {
    headerForeground: "var(--color-table-header-fg-default)",
    rowHoverBackground: "var(--color-table-row-hover-default)",
    rowSelectedBackground: "var(--color-table-row-selected-default)",
    headHeight: "var(--spacing-table-head-height-default)",
    cellPaddingX: "var(--spacing-table-cell-x-default)",
    cellPaddingYBase: "var(--spacing-table-cell-py-compact-default)",
    cellPaddingYCompact: "var(--spacing-table-cell-py-compact-default)",
    cellPaddingYComfortable: "var(--spacing-table-cell-py-comfortable-default)",
  },
  subtle: {
    headerForeground: "var(--color-table-header-fg-subtle)",
    rowHoverBackground: "var(--color-table-row-hover-subtle)",
    rowSelectedBackground: "var(--color-table-row-selected-subtle)",
    headHeight: "var(--spacing-table-head-height-subtle)",
    cellPaddingX: "var(--spacing-table-cell-x-subtle)",
    cellPaddingYBase: "var(--spacing-table-cell-py-compact-subtle)",
    cellPaddingYCompact: "var(--spacing-table-cell-py-compact-subtle)",
    cellPaddingYComfortable: "var(--spacing-table-cell-py-comfortable-subtle)",
  },
  dense: {
    headerForeground: "var(--color-table-header-fg-dense)",
    rowHoverBackground: "var(--color-table-row-hover-dense)",
    rowSelectedBackground: "var(--color-table-row-selected-dense)",
    headHeight: "var(--spacing-table-head-height-dense)",
    cellPaddingX: "var(--spacing-table-cell-x-dense)",
    cellPaddingYBase: "var(--spacing-table-cell-py-compact-dense)",
    cellPaddingYCompact: "var(--spacing-table-cell-py-compact-dense)",
    cellPaddingYComfortable: "var(--spacing-table-cell-py-comfortable-dense)",
  },
}

export interface DataTableRootProps<TData, TFilterSchema> {
  dt: DataTableInstance<TData, TFilterSchema>
  height?: string
  className?: string
  layout?: DataTableLayoutOptions
  variant?: DataTableVariant
  children: ReactNode
}

function resolveOffset(
  value: boolean | { topOffset?: number } | { bottomOffset?: number } | undefined,
): number | undefined {
  if (!value || value === true) return undefined
  if ("topOffset" in value) return value.topOffset
  if ("bottomOffset" in value) return value.bottomOffset
  return undefined
}

export function DataTableRoot<TData, TFilterSchema>({
  dt,
  height,
  className,
  layout,
  variant = "default",
  children,
}: DataTableRootProps<TData, TFilterSchema>) {
  const scrollContainer = layout?.scrollContainer ?? "window"
  const queryTopOffset = resolveOffset(layout?.stickyQueryPanel)
  const topOffset = resolveOffset(layout?.stickyHeader)
  const bottomOffset = resolveOffset(layout?.stickyPagination)
  const hasWindowSticky =
    scrollContainer === "window" &&
    Boolean(layout?.stickyQueryPanel || layout?.stickyHeader || layout?.stickyPagination)

  const style = useMemo(() => {
    const next: CSSProperties & Record<string, string> = {}
    const variantVariables = DATA_TABLE_VARIANT_CSS_VARIABLES[variant]

    if (height) {
      next.height = height
    }
    if (topOffset != null) {
      next["--dt-sticky-top"] = `${topOffset}px`
    }
    if (queryTopOffset != null) {
      next["--dt-query-top"] = `${queryTopOffset}px`
    }
    if (bottomOffset != null) {
      next["--dt-sticky-bottom"] = `${bottomOffset}px`
    }
    next["--dt-header-fg"] = variantVariables.headerForeground
    next["--dt-row-hover-bg"] = variantVariables.rowHoverBackground
    next["--dt-row-selected-bg"] = variantVariables.rowSelectedBackground
    next["--dt-head-height"] = variantVariables.headHeight
    next["--dt-cell-x"] = variantVariables.cellPaddingX
    next["--dt-cell-py-base"] = variantVariables.cellPaddingYBase
    next["--dt-cell-py-compact"] = variantVariables.cellPaddingYCompact
    next["--dt-cell-py-comfortable"] = variantVariables.cellPaddingYComfortable
    return next
  }, [height, queryTopOffset, topOffset, bottomOffset, variant])

  return (
    <DataTableProvider dt={dt} {...(layout ? { layout } : {})} variant={variant}>
      <div
        data-slot="data-table-root"
        data-dt-variant={variant}
        className={cn(
          "flex min-h-0 flex-col rounded-[inherit] bg-card",
          hasWindowSticky ? "overflow-visible" : "overflow-clip",
          " [&>*:first-child]:rounded-t-[inherit] [&>*:last-child]:rounded-b-[inherit]",
          scrollContainer === "root" && "h-full",
          className,
        )}
        style={style}
      >
        {children}
      </div>
    </DataTableProvider>
  )
}
