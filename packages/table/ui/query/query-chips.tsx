import { X } from "lucide-react"
import { Fragment } from "react"
import { Button } from "@/packages/ui/button"
import { Tag } from "@/packages/ui/tag"
import { cn } from "@/packages/ui-utils"
import { useDataTableConfig } from "../config/provider"
import { useDataTableInstance } from "../table/context"
import { clearFieldValue, getClearUpdate, getFieldValue, isFieldValueEmpty } from "./field-binding"
import {
  areValuesEqual,
  isDateValue,
  parseDateRange,
  parseNumberRange,
} from "./filters/value-utils"
import type { DataTableQueryField } from "./types"

function getOptionLabel<TFilterSchema>(
  field: DataTableQueryField<TFilterSchema, unknown>,
  value: unknown,
): string {
  if (!field.options) return String(value)
  const matched = field.options.find((option) => areValuesEqual(option.value, value))
  return matched?.label ?? String(value)
}

function formatFieldValue<TFilterSchema>(
  field: DataTableQueryField<TFilterSchema, unknown>,
  value: unknown,
  args: {
    booleanTrueText: string
    booleanFalseText: string
    formatDate: (date: Date) => string
  },
): string {
  if (field.chip?.formatValue) {
    return field.chip.formatValue(value)
  }

  switch (field.kind) {
    case "select":
      return getOptionLabel(field, value)
    case "multi-select": {
      const values = Array.isArray(value) ? value : []
      const labels = values.map((item) => getOptionLabel(field, item))
      return labels.join("、")
    }
    case "date":
      return isDateValue(value) ? args.formatDate(value) : String(value)
    case "date-range": {
      const range = parseDateRange(value)
      if (!range?.from && !range?.to) return ""
      const from = range?.from ? args.formatDate(range.from) : ""
      const to = range?.to ? args.formatDate(range.to) : ""
      if (from && to) return `${from} - ${to}`
      return from || to
    }
    case "number-range": {
      const range = parseNumberRange(value)
      if (range.min != null && range.max != null) return `${range.min} - ${range.max}`
      if (range.min != null) return `>= ${range.min}`
      if (range.max != null) return `<= ${range.max}`
      return ""
    }
    case "boolean":
      return value === true ? args.booleanTrueText : args.booleanFalseText
    default:
      return String(value)
  }
}

export interface DataTableQueryChipsProps<TFilterSchema> {
  fields: Array<DataTableQueryField<TFilterSchema, unknown>>
  className?: string
  clearLabel?: string
  showClearAll?: boolean
}

export function DataTableQueryChips<TFilterSchema>({
  fields,
  className,
  clearLabel,
  showClearAll = true,
}: DataTableQueryChipsProps<TFilterSchema>) {
  const dt = useDataTableInstance<unknown, TFilterSchema>()
  const { i18n } = useDataTableConfig()
  const activeItems = fields
    .filter((field) => field.chip?.hidden !== true)
    .map((field) => ({
      field,
      value: getFieldValue(field, dt.filters.state),
    }))
    .filter(({ field, value }) => !isFieldValueEmpty(field, value))

  if (activeItems.length === 0) return null

  const handleClearAll = () => {
    const updates = {} as Partial<TFilterSchema>
    for (const { field } of activeItems) {
      Object.assign(updates, getClearUpdate(field, dt.filters.state))
    }
    dt.filters.setBatch(updates)
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {activeItems.map(({ field, value }) => {
        const handleClear = () => {
          clearFieldValue(dt, field)
        }

        if (field.chip?.render) {
          const rendered = field.chip.render({
            value,
            clear: handleClear,
          })
          return <Fragment key={String(field.id)}>{rendered}</Fragment>
        }

        const displayValue = formatFieldValue(field, value, {
          booleanTrueText: i18n.filters.booleanTrueText,
          booleanFalseText: i18n.filters.booleanFalseText,
          formatDate: i18n.filters.formatDate,
        })

        return (
          <Tag key={String(field.id)} variant="solid" color="secondary" className="gap-1">
            <span>{field.label}</span>
            <span className="text-muted-foreground">:</span>
            <span className="max-w-52 truncate">{displayValue}</span>
            <Button
              variant="ghost"
              size="xs"
              shape="square"
              className="h-5 w-5"
              onClick={handleClear}
              aria-label={i18n.filters.removeFilterAriaLabel(field.label)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Tag>
        )
      })}
      {showClearAll ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="h-7 px-2 text-muted-foreground"
        >
          {clearLabel ?? i18n.filters.clearAllText}
        </Button>
      ) : null}
    </div>
  )
}
