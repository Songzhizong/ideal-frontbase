import {
  getCoreRowModel,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  type TableOptions,
  useReactTable,
} from "@tanstack/react-table"
import { useCallback, useMemo, useRef, useSyncExternalStore } from "react"
import { useFeatureRuntimes } from "./features"
import type {
  DataTableActions,
  DataTableDragSort,
  DataTableInstance,
  DataTablePagination,
  DataTableSelection,
  DataTableStatus,
  DataTableTree,
  TableStateSnapshot,
  UseDataTableOptions,
} from "./types"
import { useTableFilters } from "./use-data-table/filters"
import {
  applyActionPatches,
  applyActivityPatches,
  applyMetaPatches,
  buildErrors,
  isFeatureEnabled,
  mergeTableOptions,
  resolveStatus,
  toSortingState,
  toSortSnapshot,
} from "./use-data-table/helpers"
import { useStableCallback, useStableObject } from "./utils/reference-stability"

export function useDataTable<TData, TFilterSchema>(
  options: UseDataTableOptions<TData, TFilterSchema>,
): DataTableInstance<TData, TFilterSchema> {
  const { state: adapter } = options
  const snapshot = useSyncExternalStore(adapter.subscribe, adapter.getSnapshot, adapter.getSnapshot)
  const initialSnapshotRef = useRef<TableStateSnapshot<TFilterSchema>>(snapshot)

  const query = {
    page: snapshot.page,
    size: snapshot.size,
    sort: snapshot.sort,
    filters: snapshot.filters,
  }

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

  const noopAction = useStableCallback((..._args: unknown[]) => {})
  const noopAsyncAction = useStableCallback(async (..._args: unknown[]) => {})

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
      clearSelection: noopAction as DataTableActions["clearSelection"],
      selectAllCurrentPage: noopAction as DataTableActions["selectAllCurrentPage"],
      selectAllMatching: noopAsyncAction as DataTableActions["selectAllMatching"],
      resetColumnVisibility: noopAction as DataTableActions["resetColumnVisibility"],
      resetColumnSizing: noopAction as DataTableActions["resetColumnSizing"],
      setColumnPin: noopAction as DataTableActions["setColumnPin"],
      resetColumnPinning: noopAction as DataTableActions["resetColumnPinning"],
      setColumnOrder: noopAction as DataTableActions["setColumnOrder"],
      moveColumn: noopAction as DataTableActions["moveColumn"],
      resetColumnOrder: noopAction as DataTableActions["resetColumnOrder"],
      resetDensity: noopAction as DataTableActions["resetDensity"],
      expandRow: noopAction as DataTableActions["expandRow"],
      collapseRow: noopAction as DataTableActions["collapseRow"],
      toggleRowExpanded: noopAction as DataTableActions["toggleRowExpanded"],
      expandAll: noopAction as DataTableActions["expandAll"],
      collapseAll: noopAction as DataTableActions["collapseAll"],
      expandToDepth: noopAction as DataTableActions["expandToDepth"],
      moveRow: noopAsyncAction as DataTableActions["moveRow"],
    }),
    [
      refetch,
      retry,
      resetAll,
      setPage,
      setPageSize,
      setSort,
      clearSort,
      noopAction,
      noopAsyncAction,
    ],
  )

  const actions = useStableObject(
    useMemo(() => applyActionPatches(baseActions, featureRuntimes), [baseActions, featureRuntimes]),
  )

  const filters = useTableFilters({
    adapter,
    snapshotFilters: snapshot.filters,
    initialFilters: initialSnapshotRef.current.filters,
  })

  const status: DataTableStatus = resolveStatus({
    error: dataState.error,
    hasDataResult: Boolean(dataState.data),
    isInitialLoading: dataState.isInitialLoading,
    rowCount: rows.length,
  })

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

  const errors = buildErrors(dataState.error, Boolean(dataState.data))

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
              columnOrderEnabled: isFeatureEnabled(options.features?.columnOrder),
              virtualizationEnabled: isFeatureEnabled(options.features?.virtualization),
              analyticsEnabled: isFeatureEnabled(options.features?.analytics),
              expansionEnabled: isFeatureEnabled(options.features?.expansion),
              densityEnabled: isFeatureEnabled(options.features?.density),
              treeEnabled: isFeatureEnabled(options.features?.tree),
              dragSortEnabled: isFeatureEnabled(options.features?.dragSort),
            },
            ...(typeof adapter.searchKey === "string" && adapter.searchKey.trim() !== ""
              ? {
                  state: {
                    searchKey: adapter.searchKey,
                  },
                }
              : {}),
            ...(dataState.data?.extraMeta ? { data: { extraMeta: dataState.data.extraMeta } } : {}),
          },
          featureRuntimes,
        ),
      [
        options.features?.selection,
        options.features?.columnVisibility,
        options.features?.columnSizing,
        options.features?.pinning,
        options.features?.columnOrder,
        options.features?.virtualization,
        options.features?.analytics,
        options.features?.expansion,
        options.features?.density,
        options.features?.tree,
        options.features?.dragSort,
        adapter.searchKey,
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
