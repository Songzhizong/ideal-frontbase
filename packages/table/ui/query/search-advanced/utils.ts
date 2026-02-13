import type { DataTableI18n } from "../../config/provider"
import { serializeOptionValue } from "../filters/value-utils"
import type { DataTableQueryField } from "../types"

export interface SearchOptionEntry {
  key: string
  option: {
    label: string
    value: unknown
  }
}

export function normalizeKeyword(value: string): string {
  return value.trim().toLocaleLowerCase()
}

export function getFieldTypeLabel(
  fieldKind: DataTableQueryField<unknown, unknown, string>["kind"],
  i18n: DataTableI18n["advancedSearch"],
): string {
  switch (fieldKind) {
    case "text":
      return i18n.typeText
    case "select":
      return i18n.typeSelect
    case "multi-select":
      return i18n.typeMultiSelect
    case "boolean":
      return i18n.typeBoolean
    case "number-range":
      return i18n.typeNumberRange
    case "date":
      return i18n.typeDate
    case "date-range":
      return i18n.typeDateRange
    default:
      return i18n.typeText
  }
}

export function resolveOptionEntries<TFilterSchema>(
  field: DataTableQueryField<TFilterSchema, unknown, string> | null,
  i18n: DataTableI18n,
): SearchOptionEntry[] {
  if (!field) return []
  if (field.kind === "boolean") {
    if (field.options != null && field.options.length > 0) {
      return field.options.map((option) => ({
        key: serializeOptionValue(option.value),
        option: {
          label: option.label,
          value: option.value,
        },
      }))
    }
    return [
      {
        key: "true",
        option: {
          label: i18n.filters.booleanTrueText,
          value: true,
        },
      },
      {
        key: "false",
        option: {
          label: i18n.filters.booleanFalseText,
          value: false,
        },
      },
    ]
  }

  if (field.kind !== "select" && field.kind !== "multi-select") {
    return []
  }

  return (field.options ?? []).map((option) => ({
    key: serializeOptionValue(option.value),
    option: {
      label: option.label,
      value: option.value,
    },
  }))
}
