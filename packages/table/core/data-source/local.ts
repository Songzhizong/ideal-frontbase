import type {
  DataSource,
  DataTableDataResult,
  DataTableQuery,
  LocalDataSourceOptions,
} from "../types"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isEmptyFilterValue(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === "string" && value.trim() === "") return true
  return Array.isArray(value) && value.length === 0
}

function getRowValue<TData>(row: TData, key: string): unknown {
  if (!isRecord(row)) return undefined
  return row[key]
}

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === "number" && typeof b === "number") return a - b
  if (typeof a === "string" && typeof b === "string") return a.localeCompare(b)
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  return String(a).localeCompare(String(b))
}

function applyFilters<TData>(rows: TData[], filters: Record<string, unknown>): TData[] {
  const entries = Object.entries(filters).filter(([, value]) => !isEmptyFilterValue(value))
  if (entries.length === 0) return rows
  return rows.filter((row) => {
    for (const [key, value] of entries) {
      const rowValue = getRowValue(row, key)
      if (Array.isArray(value)) {
        if (!value.includes(rowValue as never)) return false
        continue
      }
      if (value instanceof Date && rowValue instanceof Date) {
        if (rowValue.getTime() !== value.getTime()) return false
        continue
      }
      if (rowValue !== value) return false
    }
    return true
  })
}

function applySort<TData>(rows: TData[], sort: DataTableQuery<unknown>["sort"]): TData[] {
  if (sort.length === 0) return rows
  const next = [...rows]
  next.sort((a, b) => {
    for (const item of sort) {
      const result = compareValues(getRowValue(a, item.field), getRowValue(b, item.field))
      if (result === 0) continue
      return item.order === "asc" ? result : -result
    }
    return 0
  })
  return next
}

function buildResult<TData>(
  rows: TData[],
  page: number,
  size: number,
  totalOverride?: number,
): DataTableDataResult<TData> {
  const pageSize = Math.max(1, size)
  const currentPage = Math.max(1, page)
  const start = (currentPage - 1) * pageSize
  const pagedRows = rows.slice(start, start + pageSize)
  const total =
    typeof totalOverride === "number" && Number.isFinite(totalOverride) && totalOverride >= 0
      ? totalOverride
      : rows.length
  return {
    rows: pagedRows,
    pageCount: total > 0 ? Math.ceil(total / pageSize) : 0,
    total,
  }
}

export function local<TData, TFilterSchema>(
  options: LocalDataSourceOptions<TData>,
): DataSource<TData, TFilterSchema> {
  return {
    use: (query) => {
      const filters = isRecord(query.filters) ? query.filters : {}
      const filteredRows = applyFilters(options.rows, filters)
      const sortedRows = applySort(filteredRows, query.sort)
      const data = buildResult(sortedRows, query.page, query.size, options.total)
      return {
        data,
        isInitialLoading: false,
        isFetching: false,
        error: null,
      }
    },
  }
}
