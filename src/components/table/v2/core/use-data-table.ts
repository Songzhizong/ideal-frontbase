import {
  getCoreRowModel,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  type TableOptions,
  useReactTable,
} from "@tanstack/react-table"
import { useCallback, useMemo, useRef, useSyncExternalStore } from "react"
import { useStableCallback, useStableObject } from "@/components/table/v2"
import { useFeatureRuntimes } from "./features"
import type {
  DataTableActions,
  DataTableActivity,
  DataTableDragSort,
  DataTableErrors,
  DataTableInstance,
  DataTablePagination,
  DataTableSelection,
  DataTableStatus,
  DataTableTree,
  TableFilters,
  TableStateSnapshot,
  UseDataTableOptions,
} from "./types"

function isFeatureEnabled<T extends { enabled?: boolean }>(feature?: T): boolean {
  if (!feature) return false
  return feature.enabled !== false
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function mergeTableOptions<TData>(
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

function applyActionPatches(
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

function applyActivityPatches(
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

function applyMetaPatches<TData, TFilterSchema>(
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

function toSortingState(sort: TableStateSnapshot<unknown>["sort"]): SortingState {
  return sort.map((item) => ({
    id: item.field,
    desc: item.order === "desc",
  }))
}

function toSortSnapshot(sorting: SortingState): TableStateSnapshot<unknown>["sort"] {
  return sorting.map((item) => ({
    field: item.id,
    order: item.desc ? "desc" : "asc",
  }))
}

function buildErrors(error: unknown, hasData: boolean): DataTableErrors | undefined {
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

export function useDataTable<TData, TFilterSchema>(
  options: UseDataTableOptions<TData, TFilterSchema>,
): DataTableInstance<TData, TFilterSchema> {
  const { state: adapter } = options
  const snapshot = useSyncExternalStore(adapter.subscribe, adapter.getSnapshot, adapter.getSnapshot)
  const initialSnapshotRef = useRef<TableStateSnapshot<TFilterSchema>>(snapshot)

  const query = useMemo(
    () => ({
      page: snapshot.page,
      size: snapshot.size,
      sort: snapshot.sort,
      filters: snapshot.filters,
    }),
    [snapshot],
  )

  const dataState = options.dataSource.use(query)
  const rows = dataState.data?.rows ?? []
  const {
    runtimes: featureRuntimes,
    selection: featureSelection,
    tree,
    dragSort,
  } = useFeatureRuntimes<TData, TFilterSchema>({
    features: options.features,
    columns: options.columns,
    getRowId: options.getRowId,
    rows,
    snapshot,
    total: dataState.data?.total,
  })
  const featureRuntimesRef = useRef(featureRuntimes)
  featureRuntimesRef.current = featureRuntimes

  const sortingState = useMemo(() => toSortingState(snapshot.sort), [snapshot.sort])

  const onSortingChange = useCallback<OnChangeFn<SortingState>>(
    (updater) => {
      const nextSorting = typeof updater === "function" ? updater(sortingState) : updater
      const next = adapter.getSnapshot()
      adapter.setSnapshot(
        {
          ...next,
          sort: toSortSnapshot(nextSorting),
        },
        "sort",
      )
    },
    [adapter, sortingState],
  )

  const onPaginationChange = useCallback<OnChangeFn<PaginationState>>(
    (updater) => {
      const nextPagination =
        typeof updater === "function"
          ? updater({
              pageIndex: snapshot.page - 1,
              pageSize: snapshot.size,
            })
          : updater
      const next = adapter.getSnapshot()
      const nextPage = nextPagination.pageIndex + 1
      const nextSize = nextPagination.pageSize
      adapter.setSnapshot(
        {
          ...next,
          page: nextPage,
          size: nextSize,
        },
        nextSize !== snapshot.size ? "size" : "page",
      )
    },
    [adapter, snapshot.page, snapshot.size],
  )

  const baseTableOptions = useMemo<TableOptions<TData>>(
    () => ({
      data: rows,
      columns: options.columns,
      ...(options.getRowId ? { getRowId: options.getRowId } : {}),
      getCoreRowModel: getCoreRowModel(),
      manualPagination: true,
      pageCount: dataState.data?.pageCount ?? 0,
      state: {
        pagination: {
          pageIndex: snapshot.page - 1,
          pageSize: snapshot.size,
        },
        sorting: sortingState,
      },
      onPaginationChange,
      manualSorting: true,
      onSortingChange,
      autoResetPageIndex: false,
    }),
    [
      rows,
      options.columns,
      options.getRowId,
      dataState.data?.pageCount,
      snapshot.page,
      snapshot.size,
      sortingState,
      onPaginationChange,
      onSortingChange,
    ],
  )

  const tableOptions = useMemo(() => {
    let next = baseTableOptions
    for (const runtime of featureRuntimes) {
      const patch = runtime.patchTableOptions?.(
        options.getRowId ? { getRowId: options.getRowId } : {},
      )
      next = mergeTableOptions(next, patch)
    }
    return next
  }, [baseTableOptions, featureRuntimes, options.getRowId])

  const table = useReactTable(tableOptions)

  const resetAll = useStableCallback(() => {
    for (const runtime of featureRuntimesRef.current) {
      runtime.onReset?.()
    }
    adapter.setSnapshot(initialSnapshotRef.current, "reset")
  })

  const setPage = useStableCallback((page: number) => {
    const next = adapter.getSnapshot()
    adapter.setSnapshot({ ...next, page: Math.max(1, page) }, "page")
  })

  const setPageSize = useStableCallback((size: number) => {
    const next = adapter.getSnapshot()
    adapter.setSnapshot(
      {
        ...next,
        page: 1,
        size: Math.max(1, size),
      },
      "size",
    )
  })

  const setSort = useStableCallback((sort: { field: string; order: "asc" | "desc" }[]) => {
    const next = adapter.getSnapshot()
    adapter.setSnapshot({ ...next, sort }, "sort")
  })

  const clearSort = useStableCallback(() => {
    const next = adapter.getSnapshot()
    adapter.setSnapshot({ ...next, sort: [] }, "sort")
  })

  const clearSelection = useStableCallback(() => {})
  const selectAllCurrentPage = useStableCallback(() => {})
  const selectAllMatching = useStableCallback(() => {})
  const resetColumnVisibility = useStableCallback(() => {})
  const resetColumnSizing = useStableCallback(() => {})
  const resetDensity = useStableCallback(() => {})
  const expandRow = useStableCallback((rowId: string) => {
    void rowId
  })
  const collapseRow = useStableCallback((rowId: string) => {
    void rowId
  })
  const toggleRowExpanded = useStableCallback((rowId: string) => {
    void rowId
  })
  const expandAll = useStableCallback(() => {})
  const collapseAll = useStableCallback(() => {})
  const expandToDepth = useStableCallback((depth: number) => {
    void depth
  })
  const moveRow = useStableCallback((activeId: string, overId: string) => {
    void activeId
    void overId
  })

  const refetch = useStableCallback(() => dataState.refetch?.())
  const retry = useStableCallback((options?: { resetInvalidFilters?: boolean }) => {
    void options
    return dataState.retry?.()
  })

  const baseActions = useMemo<DataTableActions>(
    () => ({
      refetch,
      retry,
      resetAll,
      setPage,
      setPageSize,
      setSort,
      clearSort,
      clearSelection,
      selectAllCurrentPage,
      selectAllMatching,
      resetColumnVisibility,
      resetColumnSizing,
      resetDensity,
      expandRow,
      collapseRow,
      toggleRowExpanded,
      expandAll,
      collapseAll,
      expandToDepth,
      moveRow,
    }),
    [
      refetch,
      retry,
      resetAll,
      setPage,
      setPageSize,
      setSort,
      clearSort,
      clearSelection,
      selectAllCurrentPage,
      selectAllMatching,
      resetColumnVisibility,
      resetColumnSizing,
      resetDensity,
      expandRow,
      collapseRow,
      toggleRowExpanded,
      expandAll,
      collapseAll,
      expandToDepth,
      moveRow,
    ],
  )

  const actions = useStableObject(
    useMemo(() => applyActionPatches(baseActions, featureRuntimes), [baseActions, featureRuntimes]),
  )

  const setFilter = useStableCallback(
    <K extends keyof TFilterSchema>(key: K, value: TFilterSchema[K]) => {
      const next = adapter.getSnapshot()
      adapter.setSnapshot(
        {
          ...next,
          filters: {
            ...next.filters,
            [key]: value,
          },
        },
        "filters",
      )
    },
  )

  const setBatch = useStableCallback((updates: Partial<TFilterSchema>) => {
    const next = adapter.getSnapshot()
    adapter.setSnapshot(
      {
        ...next,
        filters: {
          ...next.filters,
          ...updates,
        },
      },
      "filters",
    )
  })

  const resetFilters = useStableCallback(() => {
    const next = adapter.getSnapshot()
    adapter.setSnapshot(
      {
        ...next,
        filters: initialSnapshotRef.current.filters,
      },
      "filters",
    )
  })

  const filters: TableFilters<TFilterSchema> = useStableObject({
    state: snapshot.filters,
    set: setFilter,
    setBatch,
    reset: resetFilters,
  })

  const hasData = rows.length > 0
  const status: DataTableStatus = useMemo(() => {
    if (dataState.error && !dataState.data) {
      return { type: "error", error: dataState.error }
    }
    if (!dataState.isInitialLoading && dataState.data && rows.length === 0) {
      return { type: "empty" }
    }
    return { type: "ready" }
  }, [dataState.error, dataState.data, dataState.isInitialLoading, rows.length])

  const activity = useStableObject(
    useMemo(
      () =>
        applyActivityPatches(
          {
            isInitialLoading: dataState.isInitialLoading,
            isFetching: dataState.isFetching,
            preferencesReady: true,
          },
          featureRuntimes,
        ),
      [dataState.isInitialLoading, dataState.isFetching, featureRuntimes],
    ),
  )

  const pagination: DataTablePagination = useMemo(() => {
    const base = {
      page: snapshot.page,
      size: snapshot.size,
      pageCount: dataState.data?.pageCount ?? 0,
    }
    if (dataState.data?.total == null) {
      return base
    }
    return {
      ...base,
      total: dataState.data.total,
    }
  }, [snapshot.page, snapshot.size, dataState.data?.pageCount, dataState.data?.total])

  const selection: DataTableSelection<TData> = useStableObject(featureSelection)

  const stableTree: DataTableTree = useStableObject(tree)
  const stableDragSort: DataTableDragSort = useStableObject(dragSort)

  const errors = useMemo(() => buildErrors(dataState.error, hasData), [dataState.error, hasData])

  const meta = useStableObject(
    useMemo(
      () =>
        applyMetaPatches(
          {
            feature: {
              selectionEnabled: isFeatureEnabled(options.features?.selection),
              columnVisibilityEnabled: isFeatureEnabled(options.features?.columnVisibility),
              columnSizingEnabled: isFeatureEnabled(options.features?.columnSizing),
              pinningEnabled: isFeatureEnabled(options.features?.pinning),
              expansionEnabled: isFeatureEnabled(options.features?.expansion),
              densityEnabled: isFeatureEnabled(options.features?.density),
              treeEnabled: isFeatureEnabled(options.features?.tree),
              dragSortEnabled: isFeatureEnabled(options.features?.dragSort),
            },
            ...(dataState.data?.extraMeta ? { data: { extraMeta: dataState.data.extraMeta } } : {}),
          },
          featureRuntimes,
        ),
      [
        options.features?.selection,
        options.features?.columnVisibility,
        options.features?.columnSizing,
        options.features?.pinning,
        options.features?.expansion,
        options.features?.density,
        options.features?.tree,
        options.features?.dragSort,
        dataState.data?.extraMeta,
        featureRuntimes,
      ],
    ),
  )

  return useMemo(
    () => ({
      __version: "2.0",
      table,
      status,
      activity,
      pagination,
      filters,
      actions,
      selection,
      tree: stableTree,
      dragSort: stableDragSort,
      ...(errors ? { errors } : {}),
      meta,
    }),
    [
      table,
      status,
      activity,
      pagination,
      filters,
      actions,
      selection,
      stableTree,
      stableDragSort,
      errors,
      meta,
    ],
  )
}
