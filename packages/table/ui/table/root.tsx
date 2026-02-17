import { type CSSProperties, type ReactNode, useMemo } from "react"
import {
  resolveTableDensityCellPaddingYBase,
  resolveTableVariantCssVariables,
  type TableDensity,
} from "@/packages/ui/table"
import { cn } from "@/packages/ui-utils"
import type { DataTableInstance } from "../../core"
import { type DataTableLayoutOptions, DataTableProvider, type DataTableVariant } from "./context"

function resolveTableDensity(meta: unknown): TableDensity {
  if (typeof meta !== "object" || meta === null || Array.isArray(meta)) {
    return "compact"
  }
  const densityValue = (meta as { dtDensity?: unknown }).dtDensity
  return densityValue === "comfortable" ? "comfortable" : "compact"
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
  const density = resolveTableDensity(dt.table.options.meta)
  const hasWindowSticky =
    scrollContainer === "window" &&
    Boolean(layout?.stickyQueryPanel || layout?.stickyHeader || layout?.stickyPagination)

  const style = useMemo(() => {
    const next: CSSProperties & Record<string, string> = {}
    const variantVariables = resolveTableVariantCssVariables(variant)

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
    for (const [cssVar, cssValue] of Object.entries(variantVariables)) {
      next[cssVar] = cssValue
    }
    next["--dt-cell-py-base"] = resolveTableDensityCellPaddingYBase(variant, density)
    return next
  }, [height, queryTopOffset, topOffset, bottomOffset, variant, density])

  return (
    <DataTableProvider dt={dt} {...(layout ? { layout } : {})} variant={variant}>
      <div
        data-slot="data-table-root"
        data-dt-variant={variant}
        data-dt-density={density}
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
