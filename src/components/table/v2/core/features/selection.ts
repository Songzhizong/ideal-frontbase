import type { OnChangeFn, RowSelectionState } from "@tanstack/react-table"
import { useEffect, useMemo, useRef, useState } from "react"
import type {
  CrossPageSelection,
  DataTableActions,
  DataTableFeatureRuntime,
  DataTableSelection,
  SelectionFeatureOptions,
  TableStateSnapshot,
} from "../types"
import { shallowEqual, useStableCallback, useStableObject } from "../utils/reference-stability"
import {
  buildAllSelectedState,
  buildScopedRowIds,
  computeCrossPageMeta,
  deriveRowSelectionFromCrossPage,
  getSelectedIds,
  stableSerialize,
  updateCrossPageSelection,
} from "./selection-utils"

function isFeatureEnabled(feature?: { enabled?: boolean }): boolean {
  if (!feature) return false
  return feature.enabled !== false
}

export function useSelectionFeature<TData, TFilterSchema>(args: {
  feature: SelectionFeatureOptions<TFilterSchema> | undefined
  getRowId: ((row: TData) => string) | undefined
  getSubRows: ((row: TData) => TData[] | undefined) | undefined
  rows: TData[]
  snapshot: TableStateSnapshot<TFilterSchema>
  total: number | undefined
}): {
  selection: DataTableSelection<TData>
  runtime: DataTableFeatureRuntime<TData, TFilterSchema>
} {
  const enabled = isFeatureEnabled(args.feature)
  const mode = args.feature?.mode ?? "page"
  const crossPageConfig = args.feature?.crossPage
  const maxSelection = crossPageConfig?.maxSelection

  if (enabled && mode === "cross-page" && !args.getRowId) {
    throw new Error('Selection feature: mode="cross-page" 需要提供 getRowId')
  }

  const currentPageRowIds = useMemo(
    () =>
      buildScopedRowIds({
        rows: args.rows,
        getRowId: args.getRowId,
        getSubRows: args.getSubRows,
      }),
    [args.rows, args.getRowId, args.getSubRows],
  )

  const filtersKey = useMemo(() => stableSerialize(args.snapshot.filters), [args.snapshot.filters])

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [crossPageSelection, setCrossPageSelection] = useState<CrossPageSelection>(() => ({
    mode: "include",
    rowIds: new Set(),
  }))
  const lastSnapshotRef = useRef<TableStateSnapshot<TFilterSchema> | null>(null)
  const lastFiltersKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    if (mode === "page") {
      setRowSelection({})
      return
    }
    setCrossPageSelection({ mode: "include", rowIds: new Set() })
    setRowSelection({})
  }, [enabled, mode])

  useEffect(() => {
    if (!enabled) return
    const last = lastSnapshotRef.current
    lastSnapshotRef.current = args.snapshot
    const lastFiltersKey = lastFiltersKeyRef.current
    lastFiltersKeyRef.current = filtersKey
    if (!last) return

    if (mode === "page") {
      if (
        last.page !== args.snapshot.page ||
        last.size !== args.snapshot.size ||
        last.sort !== args.snapshot.sort ||
        last.filters !== args.snapshot.filters
      ) {
        setRowSelection({})
      }
      return
    }

    if (lastFiltersKey != null && lastFiltersKey !== filtersKey) {
      setCrossPageSelection({ mode: "include", rowIds: new Set() })
      setRowSelection({})
    }
  }, [enabled, mode, args.snapshot, filtersKey])

  useEffect(() => {
    if (!enabled) return
    if (mode !== "cross-page") return
    const derived = deriveRowSelectionFromCrossPage({
      rowIds: currentPageRowIds,
      selection: crossPageSelection,
    })
    setRowSelection((prev) =>
      shallowEqual(prev as Record<string, unknown>, derived as Record<string, unknown>)
        ? prev
        : derived,
    )
  }, [enabled, mode, currentPageRowIds, crossPageSelection])

  const onRowSelectionChange: OnChangeFn<RowSelectionState> = useStableCallback((updater) => {
    if (!enabled) return
    setRowSelection((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater
      if (mode !== "cross-page") return next
      const result = updateCrossPageSelection({
        prev: crossPageSelection,
        currentPageRowIds,
        nextRowSelection: next,
        maxSelection,
      })
      setCrossPageSelection(result.selection)
      return result.adjustedRowSelection ?? next
    })
  })

  const clearSelection = useStableCallback(() => {
    if (!enabled) return
    setRowSelection({})
    if (mode === "cross-page") {
      setCrossPageSelection({ mode: "include", rowIds: new Set() })
    }
  })

  const selectAllCurrentPage = useStableCallback(() => {
    if (!enabled) return
    if (mode !== "cross-page") {
      setRowSelection(buildAllSelectedState(currentPageRowIds, maxSelection))
      return
    }

    setCrossPageSelection((prev) => {
      if (prev.mode === "exclude") {
        const nextExcluded = new Set(prev.rowIds)
        for (const rowId of currentPageRowIds) {
          nextExcluded.delete(rowId)
        }
        return { mode: "exclude", rowIds: nextExcluded }
      }

      const limit = maxSelection
      if (limit == null || !Number.isFinite(limit) || limit < 0) {
        const nextIncluded = new Set(prev.rowIds)
        for (const rowId of currentPageRowIds) {
          nextIncluded.add(rowId)
        }
        return { mode: "include", rowIds: nextIncluded }
      }

      const nextIncluded = new Set(prev.rowIds)
      for (const rowId of currentPageRowIds) {
        if (nextIncluded.has(rowId)) continue
        if (nextIncluded.size >= limit) break
        nextIncluded.add(rowId)
      }
      return { mode: "include", rowIds: nextIncluded }
    })
  })

  const selectAllMatching = useStableCallback(async () => {
    if (!enabled) return
    if (mode !== "cross-page") {
      selectAllCurrentPage()
      return
    }

    const total = args.total
    if (typeof maxSelection === "number" && Number.isFinite(maxSelection) && maxSelection >= 0) {
      if (typeof total === "number" && total > maxSelection) return
    }

    const strategy = crossPageConfig?.selectAllStrategy ?? "client"
    if (strategy === "client") {
      setCrossPageSelection({ mode: "exclude", rowIds: new Set() })
      return
    }

    const fetchAllIds = crossPageConfig?.fetchAllIds
    if (!fetchAllIds) return
    const ids = await fetchAllIds(args.snapshot.filters)
    if (
      typeof maxSelection === "number" &&
      Number.isFinite(maxSelection) &&
      maxSelection >= 0 &&
      ids.length > maxSelection
    ) {
      return
    }
    setCrossPageSelection({ mode: "include", rowIds: new Set(ids) })
  })

  const runtime: DataTableFeatureRuntime<TData, TFilterSchema> = useStableObject({
    patchTableOptions: () => {
      if (!enabled) return {}
      return {
        enableRowSelection: true,
        state: {
          rowSelection,
        },
        onRowSelectionChange,
      }
    },
    patchActions: (_actions: DataTableActions) => {
      if (!enabled) return {}
      return {
        clearSelection,
        selectAllCurrentPage,
        selectAllMatching,
      }
    },
    onReset: () => {
      if (!enabled) return
      clearSelection()
    },
  })

  const selectedRowIds = useMemo(() => {
    if (!enabled) return []
    if (mode !== "cross-page") {
      return Array.from(getSelectedIds(rowSelection))
    }
    if (crossPageSelection.mode === "exclude") {
      return []
    }
    return Array.from(crossPageSelection.rowIds)
  }, [enabled, mode, rowSelection, crossPageSelection])

  const selectionScope = useMemo<DataTableSelection<TData>["selectionScope"]>(() => {
    if (!enabled) {
      return {
        type: "ids",
        rowIds: [],
      }
    }
    if (mode !== "cross-page") {
      return {
        type: "ids",
        rowIds: Array.from(getSelectedIds(rowSelection)),
      }
    }
    if (crossPageSelection.mode === "exclude") {
      return {
        type: "all",
        excludedRowIds: Array.from(crossPageSelection.rowIds),
      }
    }
    return {
      type: "ids",
      rowIds: Array.from(crossPageSelection.rowIds),
    }
  }, [enabled, mode, rowSelection, crossPageSelection])

  const selectedRowsCurrentPage = useMemo(() => {
    const selected = getSelectedIds(rowSelection)
    if (selected.size === 0) return []
    if (!args.getSubRows) {
      return args.rows.filter((row, index) => {
        const rowId = args.getRowId ? args.getRowId(row) : String(index)
        return selected.has(rowId)
      })
    }

    const result: TData[] = []
    const walk = (rows: TData[], parentId: string | null) => {
      rows.forEach((row, index) => {
        const rowId = args.getRowId
          ? args.getRowId(row)
          : parentId
            ? `${parentId}.${index}`
            : String(index)
        if (selected.has(rowId)) {
          result.push(row)
        }
        const children = args.getSubRows?.(row)
        if (children && children.length > 0) {
          walk(children, rowId)
        }
      })
    }
    walk(args.rows, null)
    return result
  }, [args.rows, args.getRowId, args.getSubRows, rowSelection])

  const selection: DataTableSelection<TData> = useStableObject(
    useMemo(() => {
      if (!enabled) {
        return {
          enabled: false,
          mode,
          selectedRowIds: [],
          selectedRowsCurrentPage: [],
          selectionScope,
        }
      }

      if (mode !== "cross-page") {
        return {
          enabled: true,
          mode,
          selectedRowIds,
          selectedRowsCurrentPage,
          selectionScope,
        }
      }

      const meta = computeCrossPageMeta({ selection: crossPageSelection, total: args.total })
      return {
        enabled: true,
        mode,
        selectedRowIds,
        selectedRowsCurrentPage,
        selectionScope,
        crossPage: {
          selection: crossPageSelection,
          totalSelected: meta.totalSelected,
          isAllSelected: meta.isAllSelected,
        },
      }
    }, [
      enabled,
      mode,
      selectedRowIds,
      selectedRowsCurrentPage,
      selectionScope,
      crossPageSelection,
      args.total,
    ]),
  )

  return { selection, runtime }
}
