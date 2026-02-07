import { createParser } from "nuqs"

const RANGE_SEPARATOR = "~"

export interface UrlNumberRange {
  min: number | undefined
  max: number | undefined
}

export interface UrlDateRange {
  from: Date | undefined
  to: Date | undefined
}

function splitRange(value: string): [string, string] {
  if (value.includes(RANGE_SEPARATOR)) {
    const [left = "", right = ""] = value.split(RANGE_SEPARATOR, 2)
    return [left, right]
  }
  if (value.includes(",")) {
    const [left = "", right = ""] = value.split(",", 2)
    return [left, right]
  }
  return [value, ""]
}

function parseNumberToken(value: string): number | undefined {
  const trimmed = value.trim()
  if (trimmed === "") return undefined
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed)) return undefined
  return parsed
}

function normalizeLocalDate(value: Date): Date | undefined {
  if (Number.isNaN(value.getTime())) return undefined
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function parseLocalDateToken(value: string): Date | undefined {
  const trimmed = value.trim()
  if (trimmed === "") return undefined
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (match) {
    const year = Number(match[1])
    const month = Number(match[2])
    const day = Number(match[3])
    const parsed = new Date(year, month - 1, day)
    if (
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      return undefined
    }
    return parsed
  }
  const fallback = new Date(trimmed)
  return normalizeLocalDate(fallback)
}

function toDateToken(value: Date): string {
  const normalized = normalizeLocalDate(value)
  if (!normalized) return ""
  const year = String(normalized.getFullYear())
  const month = String(normalized.getMonth() + 1).padStart(2, "0")
  const day = String(normalized.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export const parseAsNumberRange = createParser<UrlNumberRange>({
  parse: (value) => {
    const [minText, maxText] = splitRange(value)
    const min = parseNumberToken(minText)
    const max = parseNumberToken(maxText)
    if (min == null && max == null) return null
    return { min, max }
  },
  serialize: (value) => {
    const min = Number.isFinite(value.min) ? String(value.min) : ""
    const max = Number.isFinite(value.max) ? String(value.max) : ""
    return `${min}${RANGE_SEPARATOR}${max}`
  },
})

export const parseAsLocalDate = createParser<Date>({
  parse: (value) => parseLocalDateToken(value) ?? null,
  serialize: (value) => toDateToken(value),
})

export const parseAsLocalDateRange = createParser<UrlDateRange>({
  parse: (value) => {
    const [fromText, toText] = splitRange(value)
    const from = parseLocalDateToken(fromText)
    const to = parseLocalDateToken(toText)
    if (!from && !to) return null
    return { from, to }
  },
  serialize: (value) => {
    const from = value.from ? toDateToken(value.from) : ""
    const to = value.to ? toDateToken(value.to) : ""
    return `${from}${RANGE_SEPARATOR}${to}`
  },
})

export const parseAsTriStateBoolean = createParser<boolean>({
  parse: (value) => {
    const normalized = value.trim().toLowerCase()
    if (normalized === "1" || normalized === "true") return true
    if (normalized === "0" || normalized === "false") return false
    return null
  },
  serialize: (value) => (value ? "1" : "0"),
})
