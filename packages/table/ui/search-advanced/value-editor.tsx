import { Check } from "lucide-react"
import { useEffect, useRef } from "react"
import { Button } from "@/packages/ui/button"
import { Checkbox } from "@/packages/ui/checkbox"
import { Input } from "@/packages/ui/input"
import { cn } from "@/packages/ui-utils"
import type { DataTableI18n } from "../config"
import { useDataTableConfig } from "../config"
import type { AdvancedOptionEntry, AdvancedSearchField } from "./types"
import { areValuesEqual } from "./utils"

export interface DataTableAdvancedValueEditorProps<TFilterSchema> {
  activeField: AdvancedSearchField<TFilterSchema> | null
  fieldValue: unknown
  filteredOptionEntries: AdvancedOptionEntry[]
  normalizedOptionIndex: number
  pendingMultiValues: unknown[]
  pendingNumberRange: {
    min: string
    max: string
  }
  onOptionHover: (index: number) => void
  onSelectOption: (optionValue: unknown) => void
  onTogglePendingMultiValue: (optionValue: unknown) => void
  onCancelMulti: () => void
  onConfirmMulti: () => void
  onNumberRangeChange: (nextRange: { min: string; max: string }) => void
  onCancelRange: () => void
  onConfirmRange: () => void
  i18n?: Pick<DataTableI18n, "advancedSearch" | "filters">
}

export function DataTableAdvancedValueEditor<TFilterSchema>({
  activeField,
  fieldValue,
  filteredOptionEntries,
  normalizedOptionIndex,
  pendingMultiValues,
  pendingNumberRange,
  onOptionHover,
  onSelectOption,
  onTogglePendingMultiValue,
  onCancelMulti,
  onConfirmMulti,
  onNumberRangeChange,
  onCancelRange,
  onConfirmRange,
  i18n: i18nOverrides,
}: DataTableAdvancedValueEditorProps<TFilterSchema>) {
  const { i18n: globalI18n } = useDataTableConfig()
  const i18n = i18nOverrides ?? globalI18n
  const numberRangeMinInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!activeField) return
    if (activeField.type === "number-range") {
      requestAnimationFrame(() => {
        numberRangeMinInputRef.current?.focus()
      })
    }
  }, [activeField])

  if (!activeField || activeField.type === "text") {
    return null
  }

  if (activeField.type === "boolean") {
    return (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          {i18n.advancedSearch.chooseField(activeField.label)}
        </p>
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {filteredOptionEntries.length === 0 ? (
            <p className="py-5 text-center text-sm text-muted-foreground">
              {i18n.advancedSearch.noMatchingOptionsText}
            </p>
          ) : (
            filteredOptionEntries.map((entry, index) => {
              const checked = areValuesEqual(fieldValue, entry.option.value)
              const focused = normalizedOptionIndex >= 0 && index === normalizedOptionIndex
              return (
                <Button
                  key={entry.key}
                  type="button"
                  variant="ghost"
                  className={cn(
                    "h-8 w-full justify-between px-2 focus-visible:border-transparent focus-visible:ring-0",
                    focused ? "bg-accent text-accent-foreground" : null,
                  )}
                  onMouseEnter={() => onOptionHover(index)}
                  onClick={() => onSelectOption(entry.option.value)}
                >
                  <span>{entry.option.label}</span>
                  {checked ? <Check className="h-4 w-4 text-primary" /> : null}
                </Button>
              )
            })
          )}
        </div>
      </div>
    )
  }

  if (activeField.type === "number-range") {
    return (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          {i18n.advancedSearch.inputField(activeField.label)}
        </p>
        <div className="flex items-center gap-2">
          <Input
            ref={numberRangeMinInputRef}
            type="number"
            value={pendingNumberRange.min}
            onChange={(event) =>
              onNumberRangeChange({
                ...pendingNumberRange,
                min: event.target.value,
              })
            }
            placeholder={i18n.filters.numberRangeMinPlaceholder}
            className="h-8 dark:[color-scheme:dark]"
          />
          <span className="text-xs text-muted-foreground">-</span>
          <Input
            type="number"
            value={pendingNumberRange.max}
            onChange={(event) =>
              onNumberRangeChange({
                ...pendingNumberRange,
                max: event.target.value,
              })
            }
            placeholder={i18n.filters.numberRangeMaxPlaceholder}
            className="h-8 dark:[color-scheme:dark]"
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-border/50 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancelRange}>
            {i18n.advancedSearch.cancelText}
          </Button>
          <Button type="button" size="sm" onClick={onConfirmRange}>
            {i18n.advancedSearch.confirmText}
          </Button>
        </div>
      </div>
    )
  }

  if (activeField.type === "select") {
    return (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          {i18n.advancedSearch.chooseField(activeField.label)}
        </p>
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {filteredOptionEntries.length === 0 ? (
            <p className="py-5 text-center text-sm text-muted-foreground">
              {i18n.advancedSearch.noMatchingOptionsText}
            </p>
          ) : (
            filteredOptionEntries.map((entry, index) => {
              const checked = areValuesEqual(fieldValue, entry.option.value)
              const focused = normalizedOptionIndex >= 0 && index === normalizedOptionIndex
              return (
                <Button
                  key={entry.key}
                  type="button"
                  variant="ghost"
                  className={cn(
                    "h-8 w-full justify-between px-2 focus-visible:border-transparent focus-visible:ring-0",
                    focused ? "bg-accent text-accent-foreground" : null,
                  )}
                  onMouseEnter={() => onOptionHover(index)}
                  onClick={() => onSelectOption(entry.option.value)}
                >
                  <span>{entry.option.label}</span>
                  {checked ? <Check className="h-4 w-4 text-primary" /> : null}
                </Button>
              )
            })
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {i18n.advancedSearch.chooseField(activeField.label)}
      </p>
      <div className="max-h-64 space-y-1 overflow-y-auto">
        {filteredOptionEntries.length === 0 ? (
          <p className="py-5 text-center text-sm text-muted-foreground">
            {i18n.advancedSearch.noMatchingOptionsText}
          </p>
        ) : (
          filteredOptionEntries.map((entry, index) => {
            const checked = pendingMultiValues.some((value) =>
              areValuesEqual(value, entry.option.value),
            )
            const focused = normalizedOptionIndex >= 0 && index === normalizedOptionIndex
            return (
              <button
                key={entry.key}
                type="button"
                className={cn(
                  "hover:bg-accent flex h-8 w-full items-center justify-between rounded-sm px-2 text-sm outline-none",
                  focused ? "bg-accent text-accent-foreground" : null,
                )}
                onMouseEnter={() => onOptionHover(index)}
                onClick={() => onTogglePendingMultiValue(entry.option.value)}
              >
                <span>{entry.option.label}</span>
                <Checkbox checked={checked} />
              </button>
            )
          })
        )}
      </div>
      <div className="flex justify-end gap-2 border-t border-border/50 pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancelMulti}>
          {i18n.advancedSearch.cancelText}
        </Button>
        <Button type="button" size="sm" onClick={onConfirmMulti}>
          {i18n.advancedSearch.confirmText}
        </Button>
      </div>
    </div>
  )
}
