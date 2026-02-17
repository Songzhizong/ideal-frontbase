import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react"
import type { DataTableI18n } from "../../config/provider"
import { getFieldValue } from "../field-binding"
import {
  areValuesEqual,
  type DateRangeValue,
  parseDateRange,
  parseNumberInput,
  parseNumberRange,
  toTextValue,
} from "../filters/value-utils"
import type { DataTableQueryField } from "../types"
import { normalizeKeyword, resolveOptionEntries, type SearchOptionEntry } from "./utils"

function isImeComposing(event: KeyboardEvent<HTMLInputElement>): boolean {
  return event.nativeEvent.isComposing || event.keyCode === 229
}

function isOptionFieldKind(kind: DataTableQueryField<unknown, unknown, string>["kind"]): boolean {
  return kind === "select" || kind === "multi-select" || kind === "boolean"
}

function isValuePickerFieldKind(
  kind: DataTableQueryField<unknown, unknown, string>["kind"],
): boolean {
  return isOptionFieldKind(kind) || kind === "number-range"
}

interface UseQueryAdvancedSearchStateParams<TFilterSchema, TFieldId extends string> {
  fields: Array<DataTableQueryField<TFilterSchema, unknown, TFieldId>>
  defaultField: DataTableQueryField<TFilterSchema, unknown, TFieldId>
  placeholder: string | undefined
  filtersState: Readonly<TFilterSchema>
  requestInputFocus: () => void
  i18n: DataTableI18n
  onSetFieldValue: (
    field: DataTableQueryField<TFilterSchema, unknown, TFieldId>,
    value: unknown,
  ) => void
  onClearFieldValue: (field: DataTableQueryField<TFilterSchema, unknown, TFieldId>) => void
}

interface UseQueryAdvancedSearchStateResult<TFilterSchema, TFieldId extends string> {
  fieldPickerOpen: boolean
  activeField: DataTableQueryField<TFilterSchema, unknown, TFieldId> | null
  filteredOptionEntries: SearchOptionEntry[]
  pendingMultiValues: unknown[]
  pendingNumberRange: {
    min: string
    max: string
  }
  pendingDateRange: DateRangeValue | undefined
  advancedDisplayValue: string
  resolvedPlaceholder: string
  canClear: boolean
  normalizedOptionIndex: number
  isValuePickerOpen: boolean
  onFieldPickerOpenChange: (nextOpen: boolean) => void
  onValuePickerOpenChange: (nextOpen: boolean) => void
  onSelectField: (field: DataTableQueryField<TFilterSchema, unknown, TFieldId>) => void
  onInputChange: (nextValue: string) => void
  onInputFocus: () => void
  onClear: () => void
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onOptionHover: (index: number) => void
  onSelectOption: (optionValue: unknown) => void
  onTogglePendingMultiValue: (optionValue: unknown) => void
  onCancelMulti: () => void
  onConfirmMulti: () => void
  onNumberRangeChange: (nextRange: { min: string; max: string }) => void
  onCancelRange: () => void
  onConfirmRange: () => void
  onDateChange: (nextDate: Date | undefined) => void
  onDateRangeDirectChange: (nextRange: { from: Date; to?: Date } | undefined) => void
}

export function useQueryAdvancedSearchState<TFilterSchema, TFieldId extends string>({
  fields,
  defaultField,
  placeholder,
  filtersState,
  requestInputFocus,
  i18n,
  onSetFieldValue,
  onClearFieldValue,
}: UseQueryAdvancedSearchStateParams<TFilterSchema, TFieldId>): UseQueryAdvancedSearchStateResult<
  TFilterSchema,
  TFieldId
> {
  const defaultFieldValue = getFieldValue(defaultField, filtersState)
  const defaultFieldText = toTextValue(defaultFieldValue)
  const [draftValue, setDraftValue] = useState(defaultFieldText)
  const [fieldPickerOpen, setFieldPickerOpen] = useState(false)
  const [valuePickerOpen, setValuePickerOpen] = useState(false)
  const [activeFieldId, setActiveFieldId] = useState<TFieldId | null>(null)
  const [optionKeyword, setOptionKeyword] = useState("")
  const [pendingMultiValues, setPendingMultiValues] = useState<unknown[]>([])
  const [pendingNumberRange, setPendingNumberRange] = useState<{ min: string; max: string }>({
    min: "",
    max: "",
  })
  const [pendingDateRange, setPendingDateRange] = useState<DateRangeValue | undefined>(undefined)
  const [activeOptionIndex, setActiveOptionIndex] = useState(0)
  const isOpeningValuePickerRef = useRef(false)
  const lastDefaultFieldTextRef = useRef(defaultFieldText)

  useEffect(() => {
    if (lastDefaultFieldTextRef.current === defaultFieldText) return
    lastDefaultFieldTextRef.current = defaultFieldText
    if (activeFieldId == null) {
      setDraftValue(defaultFieldText)
    }
  }, [activeFieldId, defaultFieldText])

  const searchableFields = useMemo(() => fields, [fields])

  const activeField = useMemo(() => {
    if (activeFieldId == null) return null
    return searchableFields.find((field) => field.id === activeFieldId) ?? null
  }, [activeFieldId, searchableFields])

  const optionEntries = useMemo(() => {
    if (!activeField) return []
    return resolveOptionEntries(
      activeField as DataTableQueryField<TFilterSchema, unknown, string>,
      i18n,
    )
  }, [activeField, i18n])

  const filteredOptionEntries = useMemo(() => {
    const keyword = normalizeKeyword(optionKeyword)
    if (keyword === "") return optionEntries
    return optionEntries.filter((entry) => normalizeKeyword(entry.option.label).includes(keyword))
  }, [optionEntries, optionKeyword])

  const resetAdvancedDraft = (nextDraftValue = defaultFieldText) => {
    setDraftValue(nextDraftValue)
    setOptionKeyword("")
    setPendingMultiValues([])
    setPendingNumberRange({ min: "", max: "" })
    setPendingDateRange(undefined)
    setActiveFieldId(null)
    setValuePickerOpen(false)
    setActiveOptionIndex(0)
    isOpeningValuePickerRef.current = false
  }

  const resetNonTextFieldContext = () => {
    setDraftValue(defaultFieldText)
    setValuePickerOpen(false)
    setPendingMultiValues([])
    setPendingNumberRange({ min: "", max: "" })
    setPendingDateRange(undefined)
    setActiveFieldId(null)
    setOptionKeyword("")
    setActiveOptionIndex(0)
    isOpeningValuePickerRef.current = false
  }

  const onSelectField = (field: DataTableQueryField<TFilterSchema, unknown, TFieldId>) => {
    setActiveFieldId(field.id)
    setFieldPickerOpen(false)
    setDraftValue("")
    setOptionKeyword("")
    setPendingMultiValues([])
    setPendingNumberRange({ min: "", max: "" })
    setPendingDateRange(undefined)
    setActiveOptionIndex(0)

    if (field.kind === "text") {
      isOpeningValuePickerRef.current = false
      setValuePickerOpen(false)
      requestAnimationFrame(() => {
        requestInputFocus()
      })
      return
    }

    if (field.kind === "multi-select") {
      const currentValue = getFieldValue(field, filtersState)
      const nextPending = Array.isArray(currentValue) ? [...currentValue] : []
      setPendingMultiValues(nextPending)
    }

    if (field.kind === "number-range") {
      const rangeValue = parseNumberRange(getFieldValue(field, filtersState))
      setPendingNumberRange({
        min: rangeValue.min == null ? "" : String(rangeValue.min),
        max: rangeValue.max == null ? "" : String(rangeValue.max),
      })
    }

    if (field.kind === "date-range") {
      setPendingDateRange(parseDateRange(getFieldValue(field, filtersState)))
    }

    const shouldOpenValuePicker = isValuePickerFieldKind(
      field.kind as DataTableQueryField<unknown, unknown, string>["kind"],
    )
    const shouldFocusSearchInput = isOptionFieldKind(
      field.kind as DataTableQueryField<unknown, unknown, string>["kind"],
    )

    isOpeningValuePickerRef.current = shouldOpenValuePicker && shouldFocusSearchInput
    setValuePickerOpen(shouldOpenValuePicker)
    if (!shouldOpenValuePicker) {
      isOpeningValuePickerRef.current = false
      return
    }
    if (shouldFocusSearchInput) {
      requestAnimationFrame(() => {
        requestInputFocus()
        isOpeningValuePickerRef.current = false
      })
      return
    }
    isOpeningValuePickerRef.current = false
  }

  const commitFreeText = () => {
    const nextValue = draftValue.trim()
    if (nextValue === "") {
      onClearFieldValue(defaultField)
      resetAdvancedDraft("")
      return
    }
    onSetFieldValue(defaultField, nextValue)
    resetAdvancedDraft(nextValue)
  }

  const commitTextField = () => {
    if (!activeField || activeField.kind !== "text") return
    const nextValue = draftValue.trim()
    if (nextValue === "") {
      onClearFieldValue(activeField)
      const nextDraft = activeField.id === defaultField.id ? "" : defaultFieldText
      resetAdvancedDraft(nextDraft)
      return
    }
    onSetFieldValue(activeField, nextValue)
    const nextDraft = activeField.id === defaultField.id ? nextValue : defaultFieldText
    resetAdvancedDraft(nextDraft)
  }

  const commitSelectField = (optionValue: unknown) => {
    if (!activeField || activeField.kind !== "select") return
    onSetFieldValue(activeField, optionValue)
    resetAdvancedDraft(defaultFieldText)
  }

  const commitBooleanField = (optionValue: unknown) => {
    if (!activeField || activeField.kind !== "boolean" || typeof optionValue !== "boolean") return
    onSetFieldValue(activeField, optionValue)
    resetAdvancedDraft(defaultFieldText)
  }

  const commitMultiField = () => {
    if (!activeField || activeField.kind !== "multi-select") return
    onSetFieldValue(activeField, pendingMultiValues)
    resetAdvancedDraft(defaultFieldText)
  }

  const commitNumberRangeField = () => {
    if (!activeField || activeField.kind !== "number-range") return
    const nextRange = {
      min: parseNumberInput(pendingNumberRange.min),
      max: parseNumberInput(pendingNumberRange.max),
    }
    if (nextRange.min == null && nextRange.max == null) {
      onClearFieldValue(activeField)
      resetAdvancedDraft(defaultFieldText)
      return
    }
    onSetFieldValue(activeField, nextRange)
    resetAdvancedDraft(defaultFieldText)
  }

  const commitDateField = (nextDate: Date | undefined) => {
    if (!activeField || activeField.kind !== "date") return
    if (!nextDate) {
      onClearFieldValue(activeField)
      resetAdvancedDraft(defaultFieldText)
      return
    }
    onSetFieldValue(activeField, nextDate)
    resetAdvancedDraft(defaultFieldText)
  }

  const commitDateRangeField = () => {
    if (!activeField || activeField.kind !== "date-range") return
    if (!pendingDateRange?.from && !pendingDateRange?.to) {
      onClearFieldValue(activeField)
      resetAdvancedDraft(defaultFieldText)
      return
    }
    onSetFieldValue(activeField, pendingDateRange)
    resetAdvancedDraft(defaultFieldText)
  }

  const onDateRangeDirectChange = (nextRange: { from: Date; to?: Date } | undefined) => {
    if (!activeField || activeField.kind !== "date-range") return
    if (!nextRange?.from) {
      onClearFieldValue(activeField)
      resetAdvancedDraft(defaultFieldText)
      return
    }
    if (!nextRange.to) {
      setPendingDateRange({
        from: nextRange.from,
        to: undefined,
      })
      return
    }
    onSetFieldValue(activeField, {
      from: nextRange.from,
      to: nextRange.to,
    })
    resetAdvancedDraft(defaultFieldText)
  }

  const onTogglePendingMultiValue = (optionValue: unknown) => {
    setPendingMultiValues((prev) => {
      const exists = prev.some((value) => areValuesEqual(value, optionValue))
      if (!exists) return [...prev, optionValue]
      return prev.filter((value) => !areValuesEqual(value, optionValue))
    })
  }

  const onInputChange = (nextValue: string) => {
    if (activeField && isOptionFieldKind(activeField.kind)) {
      setOptionKeyword(nextValue)
      setActiveOptionIndex(0)
      if (!valuePickerOpen) {
        setValuePickerOpen(true)
      }
      return
    }
    setDraftValue(nextValue)
  }

  const onClear = () => {
    if (activeField) {
      resetAdvancedDraft(defaultFieldText)
      return
    }
    setDraftValue("")
    setOptionKeyword("")
    onClearFieldValue(defaultField)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (isImeComposing(event)) return
    const hasOptions = filteredOptionEntries.length > 0

    if (activeField && isOptionFieldKind(activeField.kind)) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault()
        if (!valuePickerOpen) {
          setValuePickerOpen(true)
        }
        if (!hasOptions) return
        setActiveOptionIndex((prev) => {
          if (event.key === "ArrowDown") {
            return prev >= filteredOptionEntries.length - 1 ? 0 : prev + 1
          }
          return prev <= 0 ? filteredOptionEntries.length - 1 : prev - 1
        })
        return
      }

      if (event.key === " " && activeField.kind === "multi-select") {
        event.preventDefault()
        if (!hasOptions) return
        const next = filteredOptionEntries[activeOptionIndex] ?? filteredOptionEntries[0]
        if (!next) return
        onTogglePendingMultiValue(next.option.value)
        return
      }
    }

    if (event.key === "Escape") {
      if (activeField && activeField.kind !== "text") {
        resetNonTextFieldContext()
        return
      }
      resetAdvancedDraft(defaultFieldText)
      return
    }

    if (event.key !== "Enter") return
    event.preventDefault()

    if (!activeField) {
      commitFreeText()
      return
    }

    if (activeField.kind === "text") {
      commitTextField()
      return
    }

    if (activeField.kind === "select" || activeField.kind === "boolean") {
      if (!hasOptions) return
      const next = filteredOptionEntries[activeOptionIndex] ?? filteredOptionEntries[0]
      if (!next) return
      if (activeField.kind === "select") {
        commitSelectField(next.option.value)
        return
      }
      commitBooleanField(next.option.value)
      return
    }

    if (activeField.kind === "number-range") {
      commitNumberRangeField()
      return
    }

    if (activeField.kind === "date") {
      return
    }

    if (activeField.kind === "date-range") {
      commitDateRangeField()
      return
    }

    if (activeField.kind === "multi-select") {
      commitMultiField()
    }
  }

  const advancedDisplayValue =
    activeField && isOptionFieldKind(activeField.kind) ? optionKeyword : draftValue
  const resolvedPlaceholder = activeField
    ? activeField.kind === "text"
      ? (activeField.placeholder ?? i18n.advancedSearch.textFieldPlaceholder(activeField.label))
      : (activeField.placeholder ?? i18n.advancedSearch.optionFieldPlaceholder(activeField.label))
    : (placeholder ?? i18n.advancedSearch.defaultPlaceholder)
  const canClear =
    activeField !== null || advancedDisplayValue.trim() !== "" || pendingMultiValues.length > 0
  const normalizedOptionIndex =
    filteredOptionEntries.length === 0
      ? -1
      : Math.min(activeOptionIndex, filteredOptionEntries.length - 1)
  const isValuePickerOpen = Boolean(
    activeField &&
      isValuePickerFieldKind(activeField.kind) &&
      activeField.kind !== "date" &&
      activeField.kind !== "date-range" &&
      valuePickerOpen,
  )

  const onValuePickerOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isOpeningValuePickerRef.current) {
      return
    }
    setValuePickerOpen(nextOpen)
    if (!nextOpen && activeField && activeField.kind !== "text") {
      resetNonTextFieldContext()
    }
  }

  return {
    fieldPickerOpen,
    activeField,
    filteredOptionEntries,
    pendingMultiValues,
    pendingNumberRange,
    pendingDateRange,
    advancedDisplayValue,
    resolvedPlaceholder,
    canClear,
    normalizedOptionIndex,
    isValuePickerOpen,
    onFieldPickerOpenChange: setFieldPickerOpen,
    onValuePickerOpenChange,
    onSelectField,
    onInputChange,
    onInputFocus: () => {
      if (activeField && isOptionFieldKind(activeField.kind)) {
        setValuePickerOpen(true)
      }
    },
    onClear,
    onKeyDown,
    onOptionHover: setActiveOptionIndex,
    onSelectOption: (optionValue) => {
      if (!activeField) return
      if (activeField.kind === "select") {
        commitSelectField(optionValue)
        return
      }
      if (activeField.kind === "boolean") {
        commitBooleanField(optionValue)
      }
    },
    onTogglePendingMultiValue,
    onCancelMulti: resetNonTextFieldContext,
    onConfirmMulti: commitMultiField,
    onNumberRangeChange: setPendingNumberRange,
    onCancelRange: resetNonTextFieldContext,
    onConfirmRange: commitNumberRangeField,
    onDateChange: commitDateField,
    onDateRangeDirectChange,
  }
}
