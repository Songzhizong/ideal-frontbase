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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/packages/ui/select"
import { Switch } from "@/packages/ui/switch"
import { cn } from "@/packages/ui-utils"
import type { FilterDefinition } from "../core"
import { useDataTableConfig } from "./config"
import { useDataTableInstance } from "./context"
import {
  areValuesEqual,
  getClearedFilterValue,
  isDateValue,
  isEmptyFilterValue,
  type NumberRangeValue,
  parseDateRange,
  parseNumberInput,
  parseNumberRange,
  serializeOptionValue,
} from "./filter-item-utils"

export type DataTableFilterLabelMode = "top" | "inside"

export interface DataTableFilterItemProps<
  TFilterSchema,
  K extends keyof TFilterSchema = keyof TFilterSchema,
> {
  definition: FilterDefinition<TFilterSchema, K>
  className?: string
  labelMode?: DataTableFilterLabelMode
  showClearButton?: boolean
}

export function DataTableFilterItem<
  TFilterSchema,
  K extends keyof TFilterSchema = keyof TFilterSchema,
>({
  definition,
  className,
  labelMode = "top",
  showClearButton = true,
}: DataTableFilterItemProps<TFilterSchema, K>) {
  const dt = useDataTableInstance<unknown, TFilterSchema>()
  const { i18n } = useDataTableConfig()
  const value = dt.filters.state[definition.key]

  const handleChange = (nextValue: TFilterSchema[K]) => {
    dt.filters.set(definition.key, nextValue)
  }

  const handleRemove = () => {
    dt.filters.set(definition.key, getClearedFilterValue(definition.type) as TFilterSchema[K])
  }

  const baseClassName = "flex min-w-[160px] flex-col gap-1"
  const canClear = !isEmptyFilterValue(value, definition.type)
  const showClear = showClearButton && canClear
  const useInlineLabel =
    labelMode === "inside" &&
    (definition.type === "text" ||
      definition.type === "select" ||
      definition.type === "multi-select")

  const content = (() => {
    switch (definition.type) {
      case "text": {
        const textValue = typeof value === "string" ? value : value == null ? "" : String(value)
        if (useInlineLabel) {
          return (
            <div className="flex w-full items-center text-sm">
              <span className="shrink-0 text-xs text-muted-foreground">{definition.label}</span>
              <span className="px-1 text-muted-foreground">:</span>
              <Input
                value={textValue}
                onChange={(event) => handleChange(event.target.value as TFilterSchema[K])}
                placeholder={definition.placeholder}
                aria-label={definition.label}
                className="h-auto border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
              />
            </div>
          )
        }
        return (
          <Input
            value={textValue}
            onChange={(event) => handleChange(event.target.value as TFilterSchema[K])}
            placeholder={definition.placeholder}
            aria-label={definition.label}
            className="h-9"
          />
        )
      }
      case "select": {
        const options = definition.options ?? []
        const entries = options.map((option) => ({
          key: serializeOptionValue(option.value),
          option,
        }))
        const selectedKey =
          entries.find((entry) => areValuesEqual(entry.option.value, value))?.key ?? ""

        const handleSelect = (nextKey: string) => {
          const selected = entries.find((entry) => entry.key === nextKey)
          if (!selected) {
            handleRemove()
            return
          }
          handleChange(selected.option.value)
        }

        return (
          <Select value={selectedKey} onValueChange={handleSelect}>
            <SelectTrigger
              className={cn(
                "w-full",
                useInlineLabel
                  ? "h-auto justify-start gap-1.5 border-0 bg-transparent px-0 py-0 shadow-none focus:ring-0 [&>svg]:ml-auto dark:bg-transparent dark:hover:bg-transparent"
                  : "h-9",
              )}
              aria-label={definition.label}
            >
              {useInlineLabel ? (
                <span className="shrink-0 text-xs text-muted-foreground">{definition.label}</span>
              ) : null}
              {useInlineLabel ? <span className="px-1 text-muted-foreground">:</span> : null}
              <SelectValue placeholder={definition.placeholder ?? i18n.filters.selectPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {entries.map((entry) => (
                <SelectItem key={entry.key} value={entry.key}>
                  {entry.option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      }
      case "multi-select": {
        const options = definition.options ?? []
        const selectedValues = Array.isArray(value) ? (value as TFilterSchema[K][]) : []
        const selectedLabels = options
          .filter((option) => selectedValues.some((item) => areValuesEqual(item, option.value)))
          .map((option) => option.label)

        const handleToggle = (optionValue: TFilterSchema[K], checked: boolean) => {
          const next = checked
            ? [...selectedValues, optionValue]
            : selectedValues.filter((item) => !areValuesEqual(item, optionValue))
          handleChange(next as TFilterSchema[K])
        }

        const triggerLabel =
          selectedLabels.length > 0
            ? selectedLabels.join("、")
            : (definition.placeholder ?? i18n.filters.selectPlaceholder)

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={useInlineLabel ? "ghost" : "outline"}
                className={cn(
                  "w-full justify-between gap-2 text-sm font-normal",
                  useInlineLabel
                    ? "h-auto px-0 py-0 hover:bg-transparent focus-visible:ring-0"
                    : "h-9 px-3",
                )}
                aria-label={definition.label}
              >
                {useInlineLabel ? (
                  <span className="shrink-0 text-xs text-muted-foreground">{definition.label}</span>
                ) : null}
                {useInlineLabel ? <span className="px-1 text-muted-foreground">:</span> : null}
                <span className="truncate">{triggerLabel}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
        )
      }
      case "date": {
        const dateValue = isDateValue(value) ? value : undefined
        return (
          <DatePicker
            value={dateValue}
            triggerClassName="bg-card"
            onChange={(nextValue) => {
              if (!nextValue) {
                handleRemove()
                return
              }
              handleChange(nextValue as TFilterSchema[K])
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
            onChange={(nextValue) => {
              if (!nextValue) {
                handleRemove()
                return
              }
              handleChange(nextValue as TFilterSchema[K])
            }}
          />
        )
      }
      case "number-range": {
        const range = parseNumberRange(value)
        const emitRange = (nextRange: NumberRangeValue) => {
          if (nextRange.min == null && nextRange.max == null) {
            handleRemove()
            return
          }
          handleChange(nextRange as TFilterSchema[K])
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
              aria-label={`${definition.label}-${i18n.filters.numberRangeMinPlaceholder}`}
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
              aria-label={`${definition.label}-${i18n.filters.numberRangeMaxPlaceholder}`}
              className="h-9 dark:[color-scheme:dark]"
            />
          </div>
        )
      }
      case "boolean": {
        const checked = value === true
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={checked}
              onCheckedChange={(nextChecked) => {
                handleChange(Boolean(nextChecked) as TFilterSchema[K])
              }}
            />
            <span className="text-sm text-muted-foreground">
              {checked ? i18n.filters.booleanTrueText : i18n.filters.booleanFalseText}
            </span>
          </div>
        )
      }
      case "custom": {
        if (!definition.render) return null
        return definition.render({
          value: value as TFilterSchema[K],
          onChange: handleChange,
          onRemove: handleRemove,
        })
      }
      default:
        return null
    }
  })()

  if (!content) return null

  if (useInlineLabel) {
    return (
      <div className={cn("flex min-w-40 items-center gap-1", className)}>
        <div className="flex h-9 min-w-0 flex-1 items-center rounded-md border border-input bg-card px-3 dark:bg-input/30">
          {content as ReactNode}
        </div>
        {showClear ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="h-7 w-7"
            onClick={handleRemove}
            aria-label={i18n.filters.removeFilterAriaLabel(definition.label)}
          >
            <X className="h-3 w-3" />
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <div className={cn(baseClassName, className)}>
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs text-muted-foreground">{definition.label}</Label>
        {showClear ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="h-5 w-5"
            onClick={handleRemove}
            aria-label={i18n.filters.removeFilterAriaLabel(definition.label)}
          >
            <X className="h-3 w-3" />
          </Button>
        ) : null}
      </div>
      {content as ReactNode}
    </div>
  )
}
