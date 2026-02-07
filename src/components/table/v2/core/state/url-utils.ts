import type { TableSort, TableStateChangeReason } from "../types"

export type SearchRecord = Record<string, string | string[] | undefined>
export type MutableSearchRecord = Record<string, string | string[] | null | undefined>
export type HistoryMode = "push" | "replace"
export type UrlPaginationOptions = {
  defaultPage?: number
  defaultSize?: number
}
export type UrlHistoryBehavior = {
  historyByReason?: Partial<Record<TableStateChangeReason, HistoryMode>>
}

const URL_STATE_DEFAULT_PAGE = 1
const URL_STATE_DEFAULT_SIZE = 10
const DEFAULT_HISTORY_BY_REASON: Record<TableStateChangeReason, HistoryMode> = {
  init: "replace",
  page: "push",
  size: "push",
  sort: "push",
  filters: "replace",
  reset: "replace",
}

export function parseSearchRecord(searchStr: string): SearchRecord {
  const params = new URLSearchParams(searchStr.startsWith("?") ? searchStr.slice(1) : searchStr)
  const record: SearchRecord = {}
  for (const [key, value] of params.entries()) {
    const existing = record[key]
    if (existing === undefined) {
      record[key] = value
      continue
    }
    if (Array.isArray(existing)) {
      existing.push(value)
      continue
    }
    record[key] = [existing, value]
  }
  return record
}

export function buildSearchParams(record: MutableSearchRecord): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(record)) {
    if (value == null) continue
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item.trim() === "") continue
        params.append(key, item)
      }
      continue
    }
    if (value.trim() === "") continue
    params.set(key, value)
  }
  const next = params.toString()
  return next ? `?${next}` : ""
}

export function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return parsed
}

export function getFirstString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

export function parseSort(value: string | null | undefined): TableSort[] {
  if (!value) return []
  const segments = value.split("|")
  const items: TableSort[] = []
  for (const segment of segments) {
    const [field, order] = segment.split(".")
    if (!field) continue
    if (order !== "asc" && order !== "desc") continue
    items.push({ field, order })
  }
  return items
}

export function serializeSort(sort: TableSort[]): string | null {
  if (sort.length === 0) return null
  return sort.map((item) => `${item.field}.${item.order}`).join("|")
}

export function getPaginationDefaults(options: UrlPaginationOptions | undefined): {
  page: number
  size: number
} {
  return {
    page: Math.max(URL_STATE_DEFAULT_PAGE, options?.defaultPage ?? URL_STATE_DEFAULT_PAGE),
    size: Math.max(URL_STATE_DEFAULT_PAGE, options?.defaultSize ?? URL_STATE_DEFAULT_SIZE),
  }
}

export function isSerializedValueEmpty(value: string | string[] | null | undefined): boolean {
  if (value == null) return true
  if (Array.isArray(value)) {
    if (value.length === 0) return true
    return value.every((item) => item.trim() === "")
  }
  return value.trim() === ""
}

export function resolveHistoryMode(
  reason: TableStateChangeReason,
  behavior: UrlHistoryBehavior | undefined,
): HistoryMode {
  return behavior?.historyByReason?.[reason] ?? DEFAULT_HISTORY_BY_REASON[reason]
}
