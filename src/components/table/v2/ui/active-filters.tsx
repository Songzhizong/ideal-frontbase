import { X } from "lucide-react"
import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { FilterDefinition, FilterType } from "../core"
import { useDataTableConfig } from "./config"
import { useDataTableInstance } from "./context"

type DateRangeValue = { from: Date | undefined; to: Date | undefined }
type NumberRangeValue = { min: number | undefined; max: number | undefined }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isDateValue(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime())
}

function areValuesEqual(a: unknown, b: unknown): boolean {
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }
  return Object.is(a, b)
}

function parseNumberRange(value: unknown): NumberRangeValue {
  if (isRecord(value)) {
    const min = typeof value.min === "number" ? value.min : undefined
    const max = typeof value.max === "number" ? value.max : undefined
    return { min, max }
  }
  if (Array.isArray(value)) {
    const [min, max] = value
    return {
      min: typeof min === "number" ? min : undefined,
      max: typeof max === "number" ? max : undefined,
    }
  }
  return { min: undefined, max: undefined }
}

function parseDateRange(value: unknown): DateRangeValue | undefined {
  if (Array.isArray(value)) {
    const [from, to] = value
    if (isDateValue(from) || isDateValue(to)) {
      return {
        from: isDateValue(from) ? from : undefined,
        to: isDateValue(to) ? to : undefined,
      }
    }
  }
  if (isRecord(value)) {
    const from = value.from
    const to = value.to
    if (isDateValue(from) || isDateValue(to)) {
      return {
        from: isDateValue(from) ? from : undefined,
        to: isDateValue(to) ? to : undefined,
      }
    }
  }
  return undefined
}

function isEmptyFilterValue(value: unknown, type: FilterType): boolean {
  if (value == null) return true
  if (type === "text" && typeof value === "string") return value.trim() === ""
  if (type === "multi-select") return !Array.isArray(value) || value.length === 0
  if (type === "number-range") {
    const range = parseNumberRange(value)
    return range.min == null && range.max == null
  }
  if (type === "date-range") {
    const range = parseDateRange(value)
    return !range?.from && !range?.to
  }
  if (type === "date") return !isDateValue(value)
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === "string") return value.trim() === ""
  return false
}

function getClearedFilterValue(type: FilterType): unknown {
  if (type === "text") return ""
  return null
}

function getOptionLabel<TFilterSchema>(
  filter: FilterDefinition<TFilterSchema, keyof TFilterSchema>,
  value: unknown,
): string {
  if (!filter.options) return String(value)
  const matched = filter.options.find((option) => areValuesEqual(option.value, value))
  return matched?.label ?? String(value)
}

function formatFilterValue<TFilterSchema>(
  filter: FilterDefinition<TFilterSchema, keyof TFilterSchema>,
  value: unknown,
  args?: {
    booleanTrueText: string
    booleanFalseText: string
    formatDate: (date: Date) => string
  },
): string {
  switch (filter.type) {
    case "select":
      return getOptionLabel(filter, value)
    case "multi-select": {
      const values = Array.isArray(value) ? value : []
      const labels = values.map((item) => getOptionLabel(filter, item))
      return labels.join("、")
    }
    case "date":
      return isDateValue(value) ? (args?.formatDate(value) ?? String(value)) : String(value)
    case "date-range": {
      const range = parseDateRange(value)
      if (!range?.from && !range?.to) return ""
      const from = range?.from ? (args?.formatDate(range.from) ?? String(range.from)) : ""
      const to = range?.to ? (args?.formatDate(range.to) ?? String(range.to)) : ""
      if (from && to) return `${from} - ${to}`
      return from || to
    }
    case "number-range": {
      const range = parseNumberRange(value)
      if (range.min != null && range.max != null) {
        return `${range.min} - ${range.max}`
      }
      if (range.min != null) return `>= ${range.min}`
      if (range.max != null) return `<= ${range.max}`
      return ""
    }
    case "boolean":
      return value === true
        ? (args?.booleanTrueText ?? "true")
        : (args?.booleanFalseText ?? "false")
    default:
      return String(value)
  }
}

export interface DataTableActiveFiltersProps<TFilterSchema> {
  filters: Array<FilterDefinition<TFilterSchema, keyof TFilterSchema>>
  className?: string
  renderTag?: (props: {
    filter: FilterDefinition<TFilterSchema, keyof TFilterSchema>
    value: unknown
    onRemove: () => void
  }) => ReactNode
  clearLabel?: string
  showClearAll?: boolean
}

export function DataTableActiveFilters<TFilterSchema>({
  filters,
  className,
  renderTag,
  clearLabel,
  showClearAll = true,
}: DataTableActiveFiltersProps<TFilterSchema>) {
  const dt = useDataTableInstance<unknown, TFilterSchema>()
  const { i18n } = useDataTableConfig()
  const activeItems = filters
    .map((filter) => ({
      filter,
      value: dt.filters.state[filter.key],
    }))
    .filter(({ filter, value }) => !isEmptyFilterValue(value, filter.type))

  if (activeItems.length === 0) return null

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {activeItems.map(({ filter, value }) => {
        const handleRemove = () => {
          dt.filters.set(
            filter.key,
            getClearedFilterValue(filter.type) as TFilterSchema[keyof TFilterSchema],
          )
        }
        if (renderTag) {
          return (
            <span key={String(filter.key)}>
              {renderTag({ filter, value, onRemove: handleRemove })}
            </span>
          )
        }
        const displayValue = formatFilterValue(filter, value, {
          booleanTrueText: i18n.filters.booleanTrueText,
          booleanFalseText: i18n.filters.booleanFalseText,
          formatDate: i18n.filters.formatDate,
        })
        return (
          <Badge key={String(filter.key)} variant="secondary" className="gap-1">
            <span>{filter.label}</span>
            <span className="text-muted-foreground">:</span>
            <span className="max-w-[160px] truncate">{displayValue}</span>
            <Button
              variant="ghost"
              size="icon-xs"
              className="h-5 w-5"
              onClick={handleRemove}
              aria-label={i18n.filters.removeFilterAriaLabel(filter.label)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )
      })}
      {showClearAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dt.filters.reset()}
          className="h-7 px-2 text-muted-foreground"
        >
          {clearLabel ?? i18n.filters.clearAllText}
        </Button>
      )}
    </div>
  )
}
