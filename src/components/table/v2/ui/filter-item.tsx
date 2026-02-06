import { ChevronDown } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { DatePicker, DateRangePicker } from "@/components/ui/date-picker-rac"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import type { FilterDefinition } from "../core"
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

function serializeOptionValue(value: unknown): string {
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (value instanceof Date) return value.toISOString()
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

function parseNumberInput(value: string): number | undefined {
  if (value.trim() === "") return undefined
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return undefined
  return parsed
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

export interface DataTableFilterItemProps<
  TFilterSchema,
  K extends keyof TFilterSchema = keyof TFilterSchema,
> {
  definition: FilterDefinition<TFilterSchema, K>
  className?: string
}

export function DataTableFilterItem<
  TFilterSchema,
  K extends keyof TFilterSchema = keyof TFilterSchema,
>({ definition, className }: DataTableFilterItemProps<TFilterSchema, K>) {
  const dt = useDataTableInstance<unknown, TFilterSchema>()
  const { i18n } = useDataTableConfig()
  const value = dt.filters.state[definition.key]

  const handleChange = (nextValue: TFilterSchema[K]) => {
    dt.filters.set(definition.key, nextValue)
  }

  const handleRemove = () => {
    dt.filters.set(definition.key, null as TFilterSchema[K])
  }

  const baseClassName = "flex min-w-[160px] flex-col gap-1"

  const content = (() => {
    switch (definition.type) {
      case "text": {
        const textValue = typeof value === "string" ? value : value == null ? "" : String(value)
        return (
          <Input
            value={textValue}
            onChange={(event) => handleChange(event.target.value as TFilterSchema[K])}
            placeholder={definition.placeholder}
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
            <SelectTrigger className="h-9 w-full">
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
                variant="outline"
                className="h-9 w-full justify-between gap-2 px-3 text-sm font-normal"
              >
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
              className="h-9"
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
              className="h-9"
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

  return (
    <div className={cn(baseClassName, className)}>
      <Label className="text-xs text-muted-foreground">{definition.label}</Label>
      {content as ReactNode}
    </div>
  )
}
