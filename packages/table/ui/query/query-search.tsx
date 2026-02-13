import { Search, X } from "lucide-react"
import { type KeyboardEvent, useEffect, useRef, useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { Button } from "@/packages/ui/button"
import { DatePicker, DateRangePicker } from "@/packages/ui/date-picker-rac"
import { Input } from "@/packages/ui/input"
import { Popover, PopoverAnchor, PopoverContent } from "@/packages/ui/popover"
import { cn } from "@/packages/ui-utils"
import { useDataTableConfig } from "../config/provider"
import { useDataTableInstance } from "../table/context"
import { clearFieldValue, getFieldValue, setFieldValue } from "./field-binding"
import { isDateValue, parseDateRange, toTextValue } from "./filters/value-utils"
import { DataTableQueryAdvancedFieldPicker } from "./search-advanced/field-picker"
import { useQueryAdvancedSearchState } from "./search-advanced/use-query-advanced-search-state"
import { DataTableQueryAdvancedValueEditor } from "./search-advanced/value-editor"
import type { DataTableQueryField } from "./types"

function isImeComposing(event: KeyboardEvent<HTMLInputElement>): boolean {
  return event.nativeEvent.isComposing || event.keyCode === 229
}

export interface DataTableQuerySearchProps<TFilterSchema, TFieldId extends string> {
  searchableFields: Array<DataTableQueryField<TFilterSchema, unknown, TFieldId>>
  pickerFields: Array<DataTableQueryField<TFilterSchema, unknown, TFieldId>>
  defaultFieldId: TFieldId
  mode: "simple" | "advanced"
  debounceMs: number
  placeholder?: string
  className?: string
}

interface DataTableQuerySearchInnerProps<TFilterSchema, TFieldId extends string> {
  searchableFields: Array<DataTableQueryField<TFilterSchema, unknown, TFieldId>>
  pickerFields: Array<DataTableQueryField<TFilterSchema, unknown, TFieldId>>
  defaultField: DataTableQueryField<TFilterSchema, unknown, TFieldId>
  debounceMs: number
  placeholder: string | undefined
  className: string | undefined
}

function DataTableQuerySimpleSearch<TFilterSchema, TFieldId extends string>({
  defaultField,
  debounceMs,
  placeholder,
  className,
}: DataTableQuerySearchInnerProps<TFilterSchema, TFieldId>) {
  const dt = useDataTableInstance<unknown, TFilterSchema>()
  const { i18n } = useDataTableConfig()
  const rawValue = getFieldValue(defaultField, dt.filters.state)
  const textValue = toTextValue(rawValue)
  const [inputValue, setInputValue] = useState(textValue)

  useEffect(() => {
    setInputValue(textValue)
  }, [textValue])

  const debouncedSetValue = useDebouncedCallback((nextValue: string) => {
    setFieldValue(dt, defaultField, nextValue)
  }, debounceMs)

  useEffect(() => () => debouncedSetValue.cancel(), [debouncedSetValue])

  const canClear = inputValue.trim() !== ""
  const placeholderText = placeholder ?? i18n.searchPlaceholder

  const handleSetSimpleValue = (nextValue: string) => {
    setInputValue(nextValue)
    if (debounceMs <= 0) {
      setFieldValue(dt, defaultField, nextValue)
      return
    }
    debouncedSetValue(nextValue)
  }

  const handleSimpleClear = () => {
    setInputValue("")
    debouncedSetValue.cancel()
    clearFieldValue(dt, defaultField)
  }

  const handleSimpleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (isImeComposing(event)) return
    if (event.key !== "Enter" || debounceMs <= 0) return
    debouncedSetValue.flush()
  }

  return (
    <div className={cn("flex min-w-0 flex-1 items-center gap-2", className)}>
      <div className="relative min-w-0 flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={inputValue}
          onChange={(event) => handleSetSimpleValue(event.target.value)}
          onKeyDown={handleSimpleKeyDown}
          placeholder={placeholderText}
          className={cn(
            "h-9 border-border/50 bg-muted/20 pl-9 shadow-none hover:bg-muted/30 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
            canClear ? "pr-9" : undefined,
          )}
        />
        {canClear ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2"
            onClick={handleSimpleClear}
            aria-label={i18n.clearSearchAriaLabel}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function DataTableQueryAdvancedSearch<TFilterSchema, TFieldId extends string>({
  searchableFields,
  pickerFields,
  defaultField,
  placeholder,
  className,
}: DataTableQuerySearchInnerProps<TFilterSchema, TFieldId>) {
  const dt = useDataTableInstance<unknown, TFilterSchema>()
  const { i18n } = useDataTableConfig()
  const inputRef = useRef<HTMLInputElement>(null)
  const showFieldPicker = pickerFields.length > 0
  const state = useQueryAdvancedSearchState({
    fields: searchableFields,
    defaultField,
    placeholder,
    filtersState: dt.filters.state,
    requestInputFocus: () => {
      inputRef.current?.focus()
    },
    i18n,
    onSetFieldValue: (field, value) => {
      setFieldValue(dt, field, value)
    },
    onClearFieldValue: (field) => {
      clearFieldValue(dt, field)
    },
  })
  const activeFieldValue = state.activeField
    ? getFieldValue(state.activeField, dt.filters.state)
    : undefined
  const isDateField = state.activeField?.kind === "date"
  const isDateRangeField = state.activeField?.kind === "date-range"
  const activeDateValue = isDateValue(activeFieldValue) ? activeFieldValue : undefined
  const activeDateRangeValue = parseDateRange(activeFieldValue)

  const handleDateFieldKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return
    event.preventDefault()
    event.stopPropagation()
    state.onClear()
    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }

  return (
    <Popover open={state.isValuePickerOpen} onOpenChange={state.onValuePickerOpenChange}>
      <PopoverAnchor asChild>
        <div className={cn("flex min-w-0 flex-1 items-center", className)}>
          <div className="flex h-9 w-full min-w-0 items-center rounded-md border border-border/50 bg-muted/20 px-2 shadow-none transition-colors hover:bg-muted/30 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]">
            <Search className="ml-1 mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            {showFieldPicker ? (
              <>
                <DataTableQueryAdvancedFieldPicker
                  fieldPickerOpen={state.fieldPickerOpen}
                  onFieldPickerOpenChange={state.onFieldPickerOpenChange}
                  activeField={state.activeField}
                  pickerFields={pickerFields}
                  onSelectField={state.onSelectField}
                  i18n={{ advancedSearch: i18n.advancedSearch }}
                />
                <span className="mx-2 h-4 w-px shrink-0 bg-border/70" />
              </>
            ) : null}
            {isDateField ? (
              <div className="w-full min-w-0 flex-1" onKeyDownCapture={handleDateFieldKeyDown}>
                <DatePicker
                  autoOpen
                  autoFocusInput
                  value={activeDateValue}
                  onChange={state.onDateChange}
                  className="w-full min-w-0"
                  triggerClassName="m-0 h-auto w-full min-w-0 border-0 bg-transparent px-0 py-0 shadow-none data-focus-within:ring-0"
                />
              </div>
            ) : isDateRangeField ? (
              <div className="w-full min-w-0 flex-1" onKeyDownCapture={handleDateFieldKeyDown}>
                <DateRangePicker
                  autoOpen
                  autoFocusInput
                  value={state.pendingDateRange ?? activeDateRangeValue}
                  onChange={state.onDateRangeDirectChange}
                  className="w-full min-w-0"
                  triggerClassName="m-0 h-auto w-full min-w-0 border-0 bg-transparent px-0 py-0 shadow-none data-focus-within:ring-0"
                />
              </div>
            ) : (
              <Input
                ref={inputRef}
                value={state.advancedDisplayValue}
                onChange={(event) => state.onInputChange(event.target.value)}
                onKeyDown={state.onKeyDown}
                onFocus={state.onInputFocus}
                placeholder={state.resolvedPlaceholder}
                className="h-auto min-w-0 flex-1 border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
              />
            )}
            {state.canClear ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="ml-1 h-6 w-6 shrink-0"
                onClick={state.onClear}
                aria-label={i18n.clearSearchAriaLabel}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            ) : null}
          </div>
        </div>
      </PopoverAnchor>
      <PopoverContent align="start" className="w-[min(420px,92vw)] p-3">
        <DataTableQueryAdvancedValueEditor
          activeField={state.activeField}
          fieldValue={activeFieldValue}
          filteredOptionEntries={state.filteredOptionEntries}
          normalizedOptionIndex={state.normalizedOptionIndex}
          pendingMultiValues={state.pendingMultiValues}
          pendingNumberRange={state.pendingNumberRange}
          onOptionHover={state.onOptionHover}
          onSelectOption={state.onSelectOption}
          onTogglePendingMultiValue={state.onTogglePendingMultiValue}
          onCancelMulti={state.onCancelMulti}
          onConfirmMulti={state.onConfirmMulti}
          onNumberRangeChange={state.onNumberRangeChange}
          onCancelRange={state.onCancelRange}
          onConfirmRange={state.onConfirmRange}
          i18n={{ advancedSearch: i18n.advancedSearch, filters: i18n.filters }}
        />
      </PopoverContent>
    </Popover>
  )
}

export function DataTableQuerySearch<TFilterSchema, TFieldId extends string>({
  searchableFields,
  pickerFields,
  defaultFieldId,
  mode,
  debounceMs,
  placeholder,
  className,
}: DataTableQuerySearchProps<TFilterSchema, TFieldId>) {
  const defaultField =
    searchableFields.find((field) => field.id === defaultFieldId) ?? searchableFields[0]
  if (!defaultField) return null

  const useSimpleMode = mode === "simple" && defaultField.kind === "text"
  if (useSimpleMode) {
    return (
      <DataTableQuerySimpleSearch
        searchableFields={searchableFields}
        pickerFields={pickerFields}
        defaultField={defaultField}
        debounceMs={debounceMs}
        placeholder={placeholder}
        className={className}
      />
    )
  }

  return (
    <DataTableQueryAdvancedSearch
      searchableFields={searchableFields}
      pickerFields={pickerFields}
      defaultField={defaultField}
      debounceMs={debounceMs}
      placeholder={placeholder}
      className={className}
    />
  )
}
