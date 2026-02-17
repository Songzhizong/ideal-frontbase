import type { DataTableInstance } from "../../core"
import { isEmptyValue } from "./filters/value-utils"
import type { DataTableQueryField } from "./types"

export function getFieldValue<TFilterSchema>(
  field: DataTableQueryField<TFilterSchema, unknown>,
  filters: Readonly<TFilterSchema>,
): unknown {
  if (field.binding.mode === "single") {
    return filters[field.binding.key]
  }
  return field.binding.getValue(filters)
}

export function isFieldValueEmpty<TFilterSchema>(
  field: DataTableQueryField<TFilterSchema, unknown>,
  value: unknown,
): boolean {
  if (field.binding.mode === "composite" && typeof field.binding.isEmpty === "function") {
    return field.binding.isEmpty(value)
  }
  return isEmptyValue(value, field.kind)
}

function getDefaultSingleBindingClearValue<TFilterSchema>(
  field: DataTableQueryField<TFilterSchema, unknown>,
  currentValue: unknown,
): unknown {
  if (field.kind === "text") return ""
  if (field.kind === "select") {
    const hasEmptyOption = (field.options ?? []).some((option) => option.value === "")
    return hasEmptyOption ? "" : null
  }
  if (field.kind === "multi-select") {
    return Array.isArray(currentValue) ? [] : null
  }
  return null
}

function getSingleBindingClearValue<TFilterSchema>(
  field: DataTableQueryField<TFilterSchema, unknown>,
  filters: Readonly<TFilterSchema>,
): unknown {
  if (field.binding.mode !== "single") return null

  const customClearValue = field.binding.clearValue as unknown
  if (typeof customClearValue === "function") {
    return (customClearValue as (state: Readonly<TFilterSchema>) => unknown)(filters)
  }
  if (customClearValue !== undefined) {
    return customClearValue
  }
  return getDefaultSingleBindingClearValue(field, filters[field.binding.key])
}

export function setFieldValue<TFilterSchema>(
  dt: DataTableInstance<unknown, TFilterSchema>,
  field: DataTableQueryField<TFilterSchema, unknown>,
  value: unknown,
) {
  if (field.binding.mode === "single") {
    const key = field.binding.key
    dt.filters.set(key, value as TFilterSchema[typeof key])
    return
  }
  dt.filters.setBatch(field.binding.setValue(value, dt.filters.state))
}

export function clearFieldValue<TFilterSchema>(
  dt: DataTableInstance<unknown, TFilterSchema>,
  field: DataTableQueryField<TFilterSchema, unknown>,
) {
  if (field.binding.mode === "single") {
    const key = field.binding.key
    dt.filters.set(
      key,
      getSingleBindingClearValue(field, dt.filters.state) as TFilterSchema[typeof key],
    )
    return
  }
  dt.filters.setBatch(field.binding.clearValue(dt.filters.state))
}

export function getClearUpdate<TFilterSchema>(
  field: DataTableQueryField<TFilterSchema, unknown>,
  filters: Readonly<TFilterSchema>,
): Partial<TFilterSchema> {
  if (field.binding.mode === "single") {
    const key = field.binding.key
    return {
      [key]: getSingleBindingClearValue(field, filters),
    } as Partial<TFilterSchema>
  }
  return field.binding.clearValue(filters)
}
