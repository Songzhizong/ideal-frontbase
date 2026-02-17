import type * as React from "react"
import { createContext, useContext } from "react"
import { cn } from "@/packages/ui-utils"

export type DescriptionListColumn = 1 | 2 | 3
export type DescriptionListOrientation = "horizontal" | "vertical"

export interface DescriptionListItem {
  key?: React.Key
  label: React.ReactNode
  value?: React.ReactNode | undefined
  span?: DescriptionListColumn | undefined
  className?: string | undefined
  labelClassName?: string | undefined
  valueClassName?: string | undefined
  empty?: React.ReactNode | undefined
}

export interface DescriptionListProps extends Omit<React.ComponentProps<"div">, "children"> {
  items?: DescriptionListItem[]
  children?: React.ReactNode
  column?: DescriptionListColumn
  orientation?: DescriptionListOrientation
  bordered?: boolean
  empty?: React.ReactNode
}

export interface DescriptionItemProps extends Omit<React.ComponentProps<"div">, "children"> {
  label: React.ReactNode
  value?: React.ReactNode | undefined
  children?: React.ReactNode
  span?: DescriptionListColumn | undefined
  labelClassName?: string | undefined
  valueClassName?: string | undefined
  empty?: React.ReactNode | undefined
}

interface DescriptionListContextValue {
  column: DescriptionListColumn
  orientation: DescriptionListOrientation
  bordered: boolean
  empty: React.ReactNode
}

const DescriptionListContext = createContext<DescriptionListContextValue | null>(null)

const COLUMN_CLASSNAME: Record<DescriptionListColumn, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
}

function resolveSpanClass(span: DescriptionListColumn | undefined, column: DescriptionListColumn) {
  const safeSpan = Math.min(Math.max(span ?? 1, 1), column)
  if (safeSpan <= 1) {
    return ""
  }
  if (column === 2) {
    return "md:col-span-2"
  }
  return safeSpan === 2 ? "md:col-span-2 xl:col-span-2" : "md:col-span-2 xl:col-span-3"
}

function isEmptyValue(value: React.ReactNode): boolean {
  if (value === null || value === undefined) {
    return true
  }
  if (typeof value === "string") {
    return value.trim().length === 0
  }
  if (Array.isArray(value)) {
    return value.length === 0 || value.every((item) => isEmptyValue(item as React.ReactNode))
  }
  return false
}

export function DescriptionItem({
  label,
  value,
  children,
  span,
  labelClassName,
  valueClassName,
  empty,
  className,
  ...props
}: DescriptionItemProps) {
  const context = useContext(DescriptionListContext)
  const column = context?.column ?? 1
  const orientation = context?.orientation ?? "horizontal"
  const bordered = context?.bordered ?? false
  const emptyContent = empty ?? context?.empty ?? "--"

  const displayValue = value ?? children
  const showEmpty = isEmptyValue(displayValue)

  return (
    <div
      data-slot="description-item"
      data-orientation={orientation}
      className={cn(
        "min-w-0",
        resolveSpanClass(span, column),
        bordered ? "rounded-lg border border-border/50 bg-card px-4 py-3" : "py-1.5",
        orientation === "horizontal"
          ? "grid grid-cols-[minmax(5rem,auto)_1fr] items-start gap-x-4 gap-y-1"
          : "space-y-1.5",
        className,
      )}
      {...props}
    >
      <div className={cn("min-w-0 text-sm text-muted-foreground", labelClassName)}>{label}</div>
      <div className={cn("min-w-0 break-words text-sm text-foreground", valueClassName)}>
        {showEmpty ? <span className="text-muted-foreground">{emptyContent}</span> : displayValue}
      </div>
    </div>
  )
}

export function DescriptionList({
  items,
  children,
  column = 1,
  orientation = "horizontal",
  bordered = false,
  empty = "--",
  className,
  ...props
}: DescriptionListProps) {
  const content = items
    ? items.map((item, index) => (
        <DescriptionItem
          key={item.key ?? `${index}-${typeof item.label === "string" ? item.label : "item"}`}
          label={item.label}
          value={item.value}
          span={item.span}
          className={item.className}
          labelClassName={item.labelClassName}
          valueClassName={item.valueClassName}
          empty={item.empty}
        />
      ))
    : children

  return (
    <DescriptionListContext value={{ column, orientation, bordered, empty }}>
      <div
        data-slot="description-list"
        data-orientation={orientation}
        data-bordered={bordered ? "true" : "false"}
        className={cn("grid gap-3", COLUMN_CLASSNAME[column], className)}
        {...props}
      >
        {content}
      </div>
    </DescriptionListContext>
  )
}
