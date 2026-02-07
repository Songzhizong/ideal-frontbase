import { useLocation, useRouter } from "@tanstack/react-router"
import type { ParserMap } from "nuqs"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { stripBasePath, withBasePath } from "@/lib/base-path"
import type {
  InferParserValues,
  TableSort,
  TableStateAdapter,
  TableStateChangeReason,
  TableStateSnapshot,
  UrlStateOptions,
} from "../types"

type SearchRecord = Record<string, string | string[] | undefined>
type MutableSearchRecord = Record<string, string | string[] | null | undefined>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parseSearchRecord(searchStr: string): SearchRecord {
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

function buildSearchParams(record: MutableSearchRecord): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(record)) {
    if (value == null) continue
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item)
      }
      continue
    }
    params.set(key, value)
  }
  const next = params.toString()
  return next ? `?${next}` : ""
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return parsed
}

function getFirstString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

function getSearchValue<TFilterSchema>(filters: TFilterSchema, key: string): unknown {
  if (!isRecord(filters)) return undefined
  return filters[key]
}

function parseSort(value: string | null | undefined): TableSort[] {
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

function serializeSort(sort: TableSort[]): string | null {
  if (sort.length === 0) return null
  return sort.map((item) => `${item.field}.${item.order}`).join("|")
}

function applyFilterBehavior<TFilterSchema>(
  prev: TableStateSnapshot<TFilterSchema>,
  next: TableStateSnapshot<TFilterSchema>,
  reason: TableStateChangeReason,
  options?: {
    history?: "push" | "replace"
    resetPageOnFilterChange?: boolean
    resetPageOnSearchChange?: boolean
    searchKey?: string
    middleware?: (args: {
      prev: TableStateSnapshot<TFilterSchema>
      next: TableStateSnapshot<TFilterSchema>
    }) => TableStateSnapshot<TFilterSchema>
  },
): TableStateSnapshot<TFilterSchema> {
  if (reason !== "filters") return next
  const resetOnFilter = options?.resetPageOnFilterChange ?? true
  if (resetOnFilter) return { ...next, page: 1 }
  const resetOnSearch = options?.resetPageOnSearchChange ?? false
  if (!resetOnSearch) return next
  const searchKey = options?.searchKey ?? "q"
  const prevSearch = getSearchValue(prev.filters, searchKey)
  const nextSearch = getSearchValue(next.filters, searchKey)
  if (Object.is(prevSearch, nextSearch)) return next
  return { ...next, page: 1 }
}

function applyDefaults<TFilters>(filters: TFilters, defaults?: Partial<TFilters>): TFilters {
  if (!defaults) return filters
  if (!isRecord(filters)) return filters
  const next = { ...filters } as Record<string, unknown>
  for (const [key, value] of Object.entries(defaults)) {
    if (next[key] == null) {
      next[key] = value
    }
  }
  return next as TFilters
}

function parseFiltersWithParsers<TParsers extends ParserMap>(
  parsers: TParsers,
  raw: SearchRecord,
): InferParserValues<TParsers> {
  const next: Record<string, unknown> = {}
  for (const [key, parser] of Object.entries(parsers)) {
    const rawValue = raw[key]
    if (rawValue == null) {
      next[key] = parser.defaultValue ?? null
      continue
    }
    if ("type" in parser && parser.type === "multi") {
      const values = Array.isArray(rawValue) ? rawValue : [rawValue]
      next[key] = parser.parse(values) ?? parser.defaultValue ?? null
      continue
    }
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue
    if (value == null) {
      next[key] = parser.defaultValue ?? null
      continue
    }
    next[key] = parser.parse(value) ?? parser.defaultValue ?? null
  }
  return next as InferParserValues<TParsers>
}

function serializeFiltersWithParsers<TParsers extends ParserMap>(
  parsers: TParsers,
  filters: InferParserValues<TParsers>,
): Record<string, string | string[] | null | undefined> {
  const next: Record<string, string | string[] | null | undefined> = {}
  const filterRecord = filters as Record<string, unknown>
  for (const [key, parser] of Object.entries(parsers)) {
    const value = filterRecord[key]
    if (value == null) {
      next[key] = null
      continue
    }
    const serialized = parser.serialize(value as never)
    next[key] = serialized ?? null
  }
  return next
}

function serializeFallbackFilters(
  filters: Record<string, unknown>,
): Record<string, string | string[] | null | undefined> {
  const next: Record<string, string | string[] | null | undefined> = {}
  for (const [key, value] of Object.entries(filters)) {
    if (value == null) {
      next[key] = null
      continue
    }
    if (Array.isArray(value)) {
      next[key] = value.map((item) => (item instanceof Date ? item.toISOString() : String(item)))
      continue
    }
    if (value instanceof Date) {
      next[key] = value.toISOString()
      continue
    }
    next[key] = String(value)
  }
  return next
}

export function stateUrl<TParsers extends ParserMap | undefined>(
  options: UrlStateOptions<TParsers>,
): TableStateAdapter<InferParserValues<TParsers>> {
  const router = useRouter()
  const location = useLocation({
    select: (state) => ({
      searchStr: state.searchStr,
      pathname: state.pathname,
      hash: state.hash,
    }),
    structuralSharing: true,
  })
  const searchStr = location.searchStr
  const behaviorRef = useRef(options.behavior)
  const defaultsRef = useRef(options.defaults)
  const parsersRef = useRef(options.parsers)
  const codecRef = useRef(options.codec)
  const keyRef = useRef(options.key)
  const listenersRef = useRef(new Set<() => void>())

  behaviorRef.current = options.behavior
  defaultsRef.current = options.defaults
  parsersRef.current = options.parsers
  codecRef.current = options.codec
  keyRef.current = options.key
  const locationRef = useRef(location)
  locationRef.current = location
  const resolvedSearchKey = options.behavior?.searchKey ?? "q"

  const lastSnapshotRef = useRef<TableStateSnapshot<InferParserValues<TParsers>> | undefined>(
    undefined,
  )
  const lastSearchStrRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    void searchStr
    for (const listener of listenersRef.current) {
      listener()
    }
  }, [searchStr])

  const getSnapshot = useCallback(() => {
    if (lastSnapshotRef.current && lastSearchStrRef.current === locationRef.current.searchStr) {
      return lastSnapshotRef.current
    }

    const searchRecord = parseSearchRecord(locationRef.current.searchStr)
    const prefix = `${keyRef.current}_`
    const pageKey = `${prefix}page`
    const sizeKey = `${prefix}size`
    const sortKey = `${prefix}sort`
    const page = parsePositiveInt(getFirstString(searchRecord[pageKey]), 1)
    const size = parsePositiveInt(getFirstString(searchRecord[sizeKey]), 10)
    const sort = parseSort(getFirstString(searchRecord[sortKey]))
    const rawFilters: SearchRecord = {}
    for (const [key, value] of Object.entries(searchRecord)) {
      if (!key.startsWith(prefix)) continue
      const filterKey = key.slice(prefix.length)
      if (filterKey === "page" || filterKey === "size" || filterKey === "sort") continue
      rawFilters[filterKey] = value
    }
    const codec = codecRef.current
    const parsers = parsersRef.current
    let parsedFilters: InferParserValues<TParsers>
    if (codec) {
      parsedFilters = codec.parse(rawFilters) as InferParserValues<TParsers>
    } else if (parsers) {
      parsedFilters = parseFiltersWithParsers(parsers, rawFilters) as InferParserValues<TParsers>
    } else {
      parsedFilters = rawFilters as InferParserValues<TParsers>
    }
    const filters = applyDefaults(parsedFilters as InferParserValues<TParsers>, defaultsRef.current)

    const nextSnapshot = {
      page,
      size,
      sort,
      filters,
    }
    lastSearchStrRef.current = locationRef.current.searchStr
    lastSnapshotRef.current = nextSnapshot
    return nextSnapshot
  }, [])

  const setSnapshot = useCallback(
    (next: TableStateSnapshot<InferParserValues<TParsers>>, reason: TableStateChangeReason) => {
      const prev = getSnapshot()
      let adjusted = applyFilterBehavior(prev, next, reason, behaviorRef.current)
      const middleware = behaviorRef.current?.middleware
      if (middleware) {
        adjusted = middleware({ prev, next: adjusted })
      }
      const searchRecord: MutableSearchRecord = {
        ...parseSearchRecord(locationRef.current.searchStr),
      }
      const prefix = `${keyRef.current}_`
      for (const key of Object.keys(searchRecord)) {
        if (key.startsWith(prefix)) {
          delete searchRecord[key]
        }
      }
      const codec = codecRef.current
      const parsers = parsersRef.current
      let filterRecord: Record<string, string | string[] | null | undefined>
      if (codec) {
        filterRecord = codec.serialize(adjusted.filters) as Record<
          string,
          string | string[] | null | undefined
        >
      } else if (parsers) {
        filterRecord = serializeFiltersWithParsers(
          parsers,
          adjusted.filters as InferParserValues<TParsers>,
        )
      } else if (isRecord(adjusted.filters)) {
        filterRecord = serializeFallbackFilters(adjusted.filters)
      } else {
        filterRecord = {}
      }
      const nextSort = serializeSort(adjusted.sort)
      searchRecord[`${prefix}page`] = String(Math.max(1, adjusted.page))
      searchRecord[`${prefix}size`] = String(Math.max(1, adjusted.size))
      searchRecord[`${prefix}sort`] = nextSort ?? null
      for (const [key, value] of Object.entries(filterRecord)) {
        searchRecord[`${prefix}${key}`] = value
      }
      const nextSearchStr = buildSearchParams(searchRecord)
      if (nextSearchStr === locationRef.current.searchStr) return
      const nextPathname = withBasePath(stripBasePath(locationRef.current.pathname))
      const nextHref = `${nextPathname}${nextSearchStr}${locationRef.current.hash}`
      const historyMode = behaviorRef.current?.history ?? "push"
      if (historyMode === "replace") {
        router.history.replace(nextHref)
      } else {
        router.history.push(nextHref)
      }
    },
    [getSnapshot, router.history],
  )

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener)
    return () => {
      listenersRef.current.delete(listener)
    }
  }, [])

  return useMemo(
    () => ({
      getSnapshot,
      setSnapshot,
      subscribe,
      searchKey: resolvedSearchKey,
    }),
    [getSnapshot, setSnapshot, subscribe, resolvedSearchKey],
  )
}
