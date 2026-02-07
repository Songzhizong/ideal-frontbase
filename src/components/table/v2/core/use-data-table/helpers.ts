import type { SortingState, TableOptions } from "@tanstack/react-table"
import type {
  DataTableActions,
  DataTableActivity,
  DataTableErrors,
  DataTableInstance,
  DataTableStatus,
  TableStateSnapshot,
} from "../types"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function isFeatureEnabled<T extends { enabled?: boolean }>(feature?: T): boolean {
  if (!feature) return false
  return feature.enabled !== false
}

export function mergeTableOptions<TData>(
  base: TableOptions<TData>,
  patch?: Partial<TableOptions<TData>>,
): TableOptions<TData> {
  if (!patch) return base
  const next: TableOptions<TData> = {
    ...base,
    ...patch,
  }
  if (patch.state) {
    next.state = { ...(base.state ?? {}), ...patch.state }
  }
  if (patch.meta && isRecord(base.meta) && isRecord(patch.meta)) {
    next.meta = { ...base.meta, ...patch.meta }
  }
  return next
}

export function applyActionPatches(
  actions: DataTableActions,
  featureRuntimes: Array<{
    patchActions?: (actions: DataTableActions) => Partial<DataTableActions>
  }>,
): DataTableActions {
  let next = actions
  for (const runtime of featureRuntimes) {
    const patch = runtime.patchActions?.(next)
    if (patch) {
      next = { ...next, ...patch }
    }
  }
  return next
}

export function applyActivityPatches(
  activity: DataTableActivity,
  featureRuntimes: Array<{
    patchActivity?: (activity: DataTableActivity) => Partial<DataTableActivity>
  }>,
): DataTableActivity {
  let next = activity
  for (const runtime of featureRuntimes) {
    const patch = runtime.patchActivity?.(next)
    if (patch) {
      next = { ...next, ...patch }
    }
  }
  return next
}

export function applyMetaPatches<TData, TFilterSchema>(
  meta: DataTableInstance<TData, TFilterSchema>["meta"],
  featureRuntimes: Array<{
    patchMeta?: (meta: DataTableInstance<TData, TFilterSchema>["meta"]) => unknown
  }>,
): DataTableInstance<TData, TFilterSchema>["meta"] {
  let next = meta
  for (const runtime of featureRuntimes) {
    const patch = runtime.patchMeta?.(next)
    if (isRecord(patch)) {
      next = { ...next, ...patch }
    }
  }
  return next
}

export function toSortingState(sort: TableStateSnapshot<unknown>["sort"]): SortingState {
  return sort.map((item) => ({
    id: item.field,
    desc: item.order === "desc",
  }))
}

export function toSortSnapshot(sorting: SortingState): TableStateSnapshot<unknown>["sort"] {
  return sorting.map((item) => ({
    field: item.id,
    order: item.desc ? "desc" : "asc",
  }))
}

export function buildErrors(error: unknown, hasData: boolean): DataTableErrors | undefined {
  if (!error) return undefined
  if (hasData) {
    return {
      nonBlocking: {
        severity: "non-blocking",
        original: error,
      },
    }
  }
  return {
    blocking: {
      severity: "blocking",
      original: error,
    },
  }
}

export function resolveStatus(args: {
  error: unknown
  hasDataResult: boolean
  isInitialLoading: boolean
  rowCount: number
}): DataTableStatus {
  if (args.error && !args.hasDataResult) return { type: "error", error: args.error }
  if (!args.isInitialLoading && args.hasDataResult && args.rowCount === 0) return { type: "empty" }
  return { type: "ready" }
}
