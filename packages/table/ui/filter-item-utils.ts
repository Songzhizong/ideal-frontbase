import type { FilterType } from "../core"

export type DateRangeValue = { from: Date | undefined; to: Date | undefined }
export type NumberRangeValue = { min: number | undefined; max: number | undefined }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function isDateValue(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime())
}

export function areValuesEqual(a: unknown, b: unknown): boolean {
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }
  return Object.is(a, b)
}

export function serializeOptionValue(value: unknown): string {
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  if (value instanceof Date) return value.toISOString()
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

export function parseNumberInput(value: string): number | undefined {
  if (value.trim() === "") return undefined
  const parsed = Number(value)
  if (Number.isNaN(parsed)) return undefined
  return parsed
}

export function parseNumberRange(value: unknown): NumberRangeValue {
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

export function parseDateRange(value: unknown): DateRangeValue | undefined {
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

export function isEmptyFilterValue(value: unknown, type: FilterType): boolean {
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

export function getClearedFilterValue(type: FilterType): unknown {
  if (type === "text") return ""
  return null
}
