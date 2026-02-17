"use client"

import type * as React from "react"
import { type CSSProperties, useMemo } from "react"

import { cn } from "@/packages/ui-utils"

export type TableVariant = "default" | "subtle" | "dense"
export type TableDensity = "compact" | "comfortable"

interface TableVariantCssVariables {
  headerForeground: string
  rowHoverBackground: string
  rowSelectedBackground: string
  headHeight: string
  cellPaddingX: string
  cellPaddingYCompact: string
  cellPaddingYComfortable: string
}

const TABLE_VARIANT_CSS_VARIABLES: Readonly<Record<TableVariant, TableVariantCssVariables>> = {
  default: {
    headerForeground: "var(--color-table-header-fg-default)",
    rowHoverBackground: "var(--color-table-row-hover-default)",
    rowSelectedBackground: "var(--color-table-row-selected-default)",
    headHeight: "var(--spacing-table-head-height-default)",
    cellPaddingX: "var(--spacing-table-cell-x-default)",
    cellPaddingYCompact: "var(--spacing-table-cell-py-compact-default)",
    cellPaddingYComfortable: "var(--spacing-table-cell-py-comfortable-default)",
  },
  subtle: {
    headerForeground: "var(--color-table-header-fg-subtle)",
    rowHoverBackground: "var(--color-table-row-hover-subtle)",
    rowSelectedBackground: "var(--color-table-row-selected-subtle)",
    headHeight: "var(--spacing-table-head-height-subtle)",
    cellPaddingX: "var(--spacing-table-cell-x-subtle)",
    cellPaddingYCompact: "var(--spacing-table-cell-py-compact-subtle)",
    cellPaddingYComfortable: "var(--spacing-table-cell-py-comfortable-subtle)",
  },
  dense: {
    headerForeground: "var(--color-table-header-fg-dense)",
    rowHoverBackground: "var(--color-table-row-hover-dense)",
    rowSelectedBackground: "var(--color-table-row-selected-dense)",
    headHeight: "var(--spacing-table-head-height-dense)",
    cellPaddingX: "var(--spacing-table-cell-x-dense)",
    cellPaddingYCompact: "var(--spacing-table-cell-py-compact-dense)",
    cellPaddingYComfortable: "var(--spacing-table-cell-py-comfortable-dense)",
  },
}

export function resolveTableVariantCssVariables(
  variant: TableVariant,
): Readonly<Record<`--dt-${string}`, string>> {
  const variables = TABLE_VARIANT_CSS_VARIABLES[variant]
  return {
    "--dt-header-fg": variables.headerForeground,
    "--dt-row-hover-bg": variables.rowHoverBackground,
    "--dt-row-selected-bg": variables.rowSelectedBackground,
    "--dt-head-height": variables.headHeight,
    "--dt-cell-x": variables.cellPaddingX,
    "--dt-cell-py-compact": variables.cellPaddingYCompact,
    "--dt-cell-py-comfortable": variables.cellPaddingYComfortable,
  }
}

export function resolveTableDensityCellPaddingYBase(
  variant: TableVariant,
  density: TableDensity,
): string {
  const variables = TABLE_VARIANT_CSS_VARIABLES[variant]
  return density === "comfortable"
    ? variables.cellPaddingYComfortable
    : variables.cellPaddingYCompact
}

interface TableProps extends React.ComponentProps<"table"> {
  containerClassName?: string
  containerRef?: React.Ref<HTMLDivElement>
  variant?: TableVariant
  density?: TableDensity
}

function Table({
  className,
  containerClassName,
  containerRef,
  variant,
  density,
  style,
  ...props
}: TableProps) {
  const tableStyle = useMemo(() => {
    const next: CSSProperties & Record<string, string | number> = {}
    if (variant) {
      const variantVariables = resolveTableVariantCssVariables(variant)
      for (const [cssVar, cssValue] of Object.entries(variantVariables)) {
        next[cssVar] = cssValue
      }
    }
    if (density) {
      const densityVariant = variant ?? "default"
      next["--dt-cell-py-base"] = resolveTableDensityCellPaddingYBase(densityVariant, density)
    }

    if (!style) {
      return next
    }
    return { ...next, ...style }
  }, [variant, density, style])

  return (
    <div
      ref={containerRef}
      data-slot="table-container"
      data-table-variant={variant}
      data-table-density={density}
      className={cn("relative w-full overflow-x-auto", containerClassName)}
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        style={tableStyle}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn("[&_tr]:border-b", className)} {...props} />
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("bg-muted/10 border-t font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-[var(--dt-row-hover-bg,var(--color-table-row-hover-default,hsl(var(--muted)/0.2)))] data-[state=selected]:bg-[var(--dt-row-selected-bg,var(--color-table-row-selected-default,hsl(var(--muted)/0.35)))] border-b transition-colors",
        className,
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-[var(--dt-head-height,var(--spacing-table-head-height-default,2.25rem))] px-[var(--dt-cell-x,var(--spacing-table-cell-x-default,0.5rem))] text-left align-middle text-xs font-medium text-[var(--dt-header-fg,var(--color-table-header-fg-default,hsl(var(--muted-foreground))))] whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-[var(--dt-cell-x,var(--spacing-table-cell-x-default,0.5rem))] py-[var(--dt-cell-py-base,var(--spacing-table-cell-py-compact-default,0.375rem))] align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
