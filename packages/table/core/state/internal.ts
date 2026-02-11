import { useCallback, useMemo, useRef } from "react"
import type {
  InternalStateOptions,
  TableStateAdapter,
  TableStateChangeReason,
  TableStateSnapshot,
} from "../types"

function applyFilterBehavior<TFilterSchema>(
  _prev: TableStateSnapshot<TFilterSchema>,
  next: TableStateSnapshot<TFilterSchema>,
  reason: TableStateChangeReason,
  options?: InternalStateOptions<TFilterSchema>["behavior"],
): TableStateSnapshot<TFilterSchema> {
  if (reason !== "filters") return next
  const shouldReset = options?.resetPageOnFilterChange ?? true
  if (!shouldReset) return next
  return { ...next, page: 1 }
}

function buildInitialSnapshot<TFilterSchema>(
  options: InternalStateOptions<TFilterSchema>,
): TableStateSnapshot<TFilterSchema> {
  return {
    page: options.initial.page ?? 1,
    size: options.initial.size ?? 10,
    sort: options.initial.sort ?? [],
    filters: options.initial.filters ?? ({} as TFilterSchema),
  }
}

export function stateInternal<TFilterSchema>(
  options: InternalStateOptions<TFilterSchema>,
): TableStateAdapter<TFilterSchema> {
  const listenersRef = useRef(new Set<() => void>())
  const snapshotRef = useRef<TableStateSnapshot<TFilterSchema>>(buildInitialSnapshot(options))
  const behaviorRef = useRef(options.behavior)
  const searchKeyRef = useRef(options.searchKey)
  behaviorRef.current = options.behavior
  searchKeyRef.current = options.searchKey

  const getSnapshot = useCallback(() => snapshotRef.current, [])

  const setSnapshot = useCallback(
    (next: TableStateSnapshot<TFilterSchema>, reason: TableStateChangeReason) => {
      snapshotRef.current = applyFilterBehavior(
        snapshotRef.current,
        next,
        reason,
        behaviorRef.current,
      )
      for (const listener of listenersRef.current) {
        listener()
      }
    },
    [],
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
      ...(typeof searchKeyRef.current === "string" && searchKeyRef.current.trim() !== ""
        ? { searchKey: searchKeyRef.current }
        : {}),
    }),
    [getSnapshot, setSnapshot, subscribe, options.searchKey],
  )
}
