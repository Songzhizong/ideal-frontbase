import { ChevronDown, X } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@/packages/ui/button"
import { DatePicker, DateRangePicker } from "@/packages/ui/date-picker-rac"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/packages/ui/dropdown-menu"
import { Input } from "@/packages/ui/input"
import { Label } from "@/packages/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { Switch } from "@/packages/ui/switch"
import { cn } from "@/packages/ui-utils"
import { useDataTableConfig } from "../config/provider"
import { useDataTableInstance } from "../table/context"
import { clearFieldValue, getFieldValue, isFieldValueEmpty, setFieldValue } from "./field-binding"
import {
  areValuesEqual,
  isDateValue,
  type NumberRangeValue,
  parseDateRange,
  parseNumberInput,
  parseNumberRange,
  serializeOptionValue,
} from "./filters/value-utils"
import type { DataTableQueryField, DataTableQueryFieldLabelMode } from "./types"

const TRIGGER_CLEAR_ICON_CLASS = "h-4 w-4 opacity-50"

export interface DataTableQueryFieldItemProps<TFilterSchema> {
  field: DataTableQueryField<TFilterSchema, unknown>
  className?: string
  labelMode?: DataTableQueryFieldLabelMode
}

export function DataTableQueryFieldItem<TFilterSchema>({
  field,
  className,
  labelMode = "top",
}: DataTableQueryFieldItemProps<TFilterSchema>) {
  const dt = useDataTableInstance<unknown, TFilterSchema>()
  const { i18n } = useDataTableConfig()
  const value = getFieldValue(field, dt.filters.state)
  const canClear = !isFieldValueEmpty(field, value)
  const useTriggerClearButton = field.kind === "select" || field.kind === "multi-select"
  const hideLabel = field.ui?.hideLabel ?? false

  const handleChange = (nextValue: unknown) => {
    setFieldValue(dt, field, nextValue)
  }

  const handleClear = () => {
    clearFieldValue(dt, field)
  }
  const useInlineLabel =
    labelMode === "inside" &&
    (field.kind === "text" || field.kind === "select" || field.kind === "multi-select")

  const renderContent = (): ReactNode => {
    switch (field.kind) {
      case "text": {
        const textValue = typeof value === "string" ? value : value == null ? "" : String(value)
        if (useInlineLabel) {
          return (
            <div className="flex w-full items-center text-sm">
              <span className="shrink-0 text-xs text-muted-foreground">{field.label}</span>
              <span className="px-1 text-muted-foreground">:</span>
              <Input
                value={textValue}
                onChange={(event) => handleChange(event.target.value)}
                placeholder={field.placeholder}
                aria-label={field.label}
                className="h-auto border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
              />
            </div>
          )
        }
        return (
          <Input
            value={textValue}
            onChange={(event) => handleChange(event.target.value)}
            placeholder={field.placeholder}
            aria-label={field.label}
            className="h-9"
          />
        )
      }
      case "select": {
        const options = field.options ?? []
        const entries = options.map((option) => ({
          key: serializeOptionValue(option.value),
          option,
        }))
        const selectedEntry = entries.find((entry) => areValuesEqual(entry.option.value, value))
        const selectedKey = selectedEntry?.key

        const EMPTY_KEY = "__EMPTY__"
        const triggerValue = selectedKey === "" ? EMPTY_KEY : (selectedKey ?? "")

        const handleSelect = (nextKey: string) => {
          const lookupKey = nextKey === EMPTY_KEY ? "" : nextKey
          const selected = entries.find((entry) => entry.key === lookupKey)
          if (!selected) {
            handleClear()
            return
          }
          handleChange(selected.option.value)
        }

        return (
          <div className="relative w-full">
            <Select value={triggerValue} onValueChange={handleSelect}>
              <SelectTrigger
                className={cn(
                  "w-full",
                  canClear && "pr-8",
                  useInlineLabel
                    ? "h-auto justify-start gap-1.5 border-0 bg-transparent px-0 py-0 shadow-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-transparent dark:hover:bg-transparent [&>svg]:ml-auto"
                    : "h-9",
                )}
                aria-label={field.label}
              >
                {useInlineLabel ? (
                  <span className="shrink-0 text-xs text-muted-foreground">{field.label}</span>
                ) : null}
                {useInlineLabel ? <span className="px-1 text-muted-foreground">:</span> : null}
                <SelectValue
                  className="min-w-0 text-left"
                  placeholder={field.placeholder ?? i18n.filters.selectPlaceholder}
                />
              </SelectTrigger>
              <SelectContent>
                {entries.map((entry) => (
                  <SelectItem key={entry.key} value={entry.key === "" ? EMPTY_KEY : entry.key}>
                    {entry.option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {canClear ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className={cn(
                  "absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
                  useInlineLabel ? "right-0" : "right-2",
                )}
                onPointerDown={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  handleClear()
                }}
                aria-label={i18n.filters.removeFilterAriaLabel(field.label)}
              >
                <X className={TRIGGER_CLEAR_ICON_CLASS} />
              </Button>
            ) : null}
          </div>
        )
      }
      case "multi-select": {
        const options = field.options ?? []
        const selectedValues = Array.isArray(value) ? value : []
        const selectedLabels = options
          .filter((option) => selectedValues.some((item) => areValuesEqual(item, option.value)))
          .map((option) => option.label)
        const triggerLabel =
          selectedLabels.length > 0
            ? selectedLabels.join("、")
            : (field.placeholder ?? i18n.filters.selectPlaceholder)

        const handleToggle = (optionValue: unknown, checked: boolean) => {
          const next = checked
            ? [...selectedValues, optionValue]
            : selectedValues.filter((item) => !areValuesEqual(item, optionValue))
          handleChange(next)
        }

        return (
          <div className="relative w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={useInlineLabel ? "ghost" : "outline"}
                  className={cn(
                    "w-full justify-between gap-2 text-sm font-normal",
                    canClear && "pr-8",
                    useInlineLabel
                      ? "h-auto px-0 py-0 hover:bg-transparent focus-visible:ring-0"
                      : "h-9 px-3",
                  )}
                >
                  {useInlineLabel ? (
                    <span className="shrink-0 text-xs text-muted-foreground">{field.label}</span>
                  ) : null}
                  {useInlineLabel ? <span className="px-1 text-muted-foreground">:</span> : null}
                  <span className="truncate">{triggerLabel}</span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {options.map((option) => {
                  const checked = selectedValues.some((item) => areValuesEqual(item, option.value))
                  return (
                    <DropdownMenuCheckboxItem
                      key={serializeOptionValue(option.value)}
                      checked={checked}
                      onCheckedChange={(nextChecked) =>
                        handleToggle(option.value, Boolean(nextChecked))
                      }
                    >
                      {option.label}
                    </DropdownMenuCheckboxItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            {canClear ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className={cn(
                  "absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
                  useInlineLabel ? "right-0" : "right-2",
                )}
                onPointerDown={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  handleClear()
                }}
                aria-label={i18n.filters.removeFilterAriaLabel(field.label)}
              >
                <X className={TRIGGER_CLEAR_ICON_CLASS} />
              </Button>
            ) : null}
          </div>
        )
      }
      case "date": {
        const dateValue = isDateValue(value) ? value : undefined
        return (
          <DatePicker
            value={dateValue}
            triggerClassName="bg-card"
            onChange={(nextDate) => {
              if (!nextDate) {
                handleClear()
                return
              }
              handleChange(nextDate)
            }}
          />
        )
      }
      case "date-range": {
        const rangeValue = parseDateRange(value)
        return (
          <DateRangePicker
            value={rangeValue}
            triggerClassName="bg-card"
            onChange={(nextRange) => {
              if (!nextRange) {
                handleClear()
                return
              }
              handleChange(nextRange)
            }}
          />
        )
      }
      case "number-range": {
        const range = parseNumberRange(value)
        const emitRange = (nextRange: NumberRangeValue) => {
          if (nextRange.min == null && nextRange.max == null) {
            handleClear()
            return
          }
          handleChange(nextRange)
        }
        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={range.min ?? ""}
              onChange={(event) => {
                const nextMin = parseNumberInput(event.target.value)
                emitRange({ ...range, min: nextMin })
              }}
              placeholder={i18n.filters.numberRangeMinPlaceholder}
              aria-label={`${field.label}-${i18n.filters.numberRangeMinPlaceholder}`}
              className="h-9 dark:[color-scheme:dark]"
            />
            <span className="text-xs text-muted-foreground">-</span>
            <Input
              type="number"
              value={range.max ?? ""}
              onChange={(event) => {
                const nextMax = parseNumberInput(event.target.value)
                emitRange({ ...range, max: nextMax })
              }}
              placeholder={i18n.filters.numberRangeMaxPlaceholder}
              aria-label={`${field.label}-${i18n.filters.numberRangeMaxPlaceholder}`}
              className="h-9 dark:[color-scheme:dark]"
            />
          </div>
        )
      }
      case "boolean": {
        const checked = value === true
        return (
          <div className="flex h-9 items-center gap-2">
            <Switch
              checked={checked}
              onCheckedChange={(nextChecked) => handleChange(Boolean(nextChecked))}
            />
            <span className="text-sm text-muted-foreground">
              {checked ? i18n.filters.booleanTrueText : i18n.filters.booleanFalseText}
            </span>
          </div>
        )
      }
      case "custom": {
        if (!field.render) return null
        return field.render({
          value,
          setValue: handleChange,
          clear: handleClear,
          filters: dt.filters.state,
        })
      }
      default:
        return null
    }
  }

  const content = renderContent()
  if (!content) return null

  if (useInlineLabel) {
    return (
      <div
        className={cn(
          "relative flex h-9 items-center rounded-md border border-input bg-card px-3 transition-[border-color,box-shadow] dark:bg-input/30 focus-within:border-ring/50 focus-within:ring-2 focus-within:ring-ring/30",
          canClear && !useTriggerClearButton && "pr-10",
          className,
        )}
      >
        <div className="flex min-w-0 flex-1 items-center">{content}</div>
        {canClear && !useTriggerClearButton ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="absolute right-1.5 top-1/2 h-6 w-6 -translate-y-1/2"
            onClick={handleClear}
            aria-label={i18n.filters.removeFilterAriaLabel(field.label)}
          >
            <X className="h-3 w-3" />
          </Button>
        ) : null}
      </div>
    )
  }

  if (hideLabel) {
    return <div className={className}>{content}</div>
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs text-muted-foreground">{field.label}</Label>
        {canClear && !useTriggerClearButton ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="h-5 w-5"
            onClick={handleClear}
            aria-label={i18n.filters.removeFilterAriaLabel(field.label)}
          >
            <X className="h-3 w-3" />
          </Button>
        ) : null}
      </div>
      {content}
    </div>
  )
}
