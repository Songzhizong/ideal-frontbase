import type { ExpandedState } from "@tanstack/react-table"
import { getExpandedRowModel } from "@tanstack/react-table"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type {
  DataTableActions,
  DataTableFeatureRuntime,
  DataTableTree,
  TreeFeatureOptions,
} from "../types"
import { useStableCallback, useStableObject } from "../utils/reference-stability"

function isFeatureEnabled(feature?: { enabled?: boolean }): boolean {
  if (!feature) return false
  return feature.enabled !== false
}

function buildRowId<TData>(args: {
  row: TData
  index: number
  parentId: string | null
  getRowId: ((row: TData) => string) | undefined
}): string {
  if (args.getRowId) return args.getRowId(args.row)
  return args.parentId ? `${args.parentId}.${args.index}` : String(args.index)
}

function buildExpandedFromDepth<TData>(args: {
  rows: TData[]
  getRowId: ((row: TData) => string) | undefined
  getSubRows: (row: TData) => TData[] | undefined
  depth: number
}): Record<string, boolean> {
  if (!Number.isFinite(args.depth) || args.depth <= 0) return {}
  if (args.depth === Number.POSITIVE_INFINITY) {
    const expanded: Record<string, boolean> = {}
    const walk = (rows: TData[], parentId: string | null) => {
      rows.forEach((row, index) => {
        const rowId = buildRowId({ row, index, parentId, getRowId: args.getRowId })
        const children = args.getSubRows(row)
        if (children && children.length > 0) {
          expanded[rowId] = true
          walk(children, rowId)
        }
      })
    }
    walk(args.rows, null)
    return expanded
  }

  const expanded: Record<string, boolean> = {}
  const walk = (rows: TData[], parentId: string | null, depth: number) => {
    if (depth >= args.depth) return
    rows.forEach((row, index) => {
      const rowId = buildRowId({ row, index, parentId, getRowId: args.getRowId })
      const children = args.getSubRows(row)
      if (children && children.length > 0) {
        expanded[rowId] = true
        walk(children, rowId, depth + 1)
      }
    })
  }
  walk(args.rows, null, 0)
  return expanded
}

function mergeExpandedState(
  base: Record<string, boolean>,
  ids: string[] | undefined,
): Record<string, boolean> {
  if (!ids || ids.length === 0) return base
  const next = { ...base }
  for (const id of ids) {
    next[id] = true
  }
  return next
}

export function useTreeFeature<TData, TFilterSchema>(args: {
  feature: TreeFeatureOptions<TData> | undefined
  getRowId: ((row: TData) => string) | undefined
  rows: TData[]
}): {
  tree: DataTableTree
  runtime: DataTableFeatureRuntime<TData, TFilterSchema>
  getSubRows: ((row: TData) => TData[] | undefined) | undefined
} {
  const enabled = isFeatureEnabled(args.feature)
  const indentSize = args.feature?.indentSize ?? 24
  const selectionBehavior = args.feature?.selectionBehavior ?? "independent"
  const allowNesting = args.feature?.allowNesting ?? false

  if (enabled && args.feature?.loadChildren && !args.getRowId) {
    throw new Error("Tree feature: 使用 loadChildren 时需要提供 getRowId")
  }

  const [childrenById, setChildrenById] = useState<Record<string, TData[]>>({})
  const [loadingRowIds, setLoadingRowIds] = useState<Set<string>>(() => new Set())
  const [expanded, setExpanded] = useState<ExpandedState>(() => ({}))
  const expandedRef = useRef(expanded)
  expandedRef.current = expanded

  const getSubRows = useCallback(
    (row: TData): TData[] | undefined => {
      if (!enabled) return undefined
      if (args.feature?.getSubRows) return args.feature.getSubRows(row)
      if (!args.feature?.loadChildren) return undefined
      if (!args.getRowId) return undefined
      const rowId = args.getRowId(row)
      return childrenById[rowId]
    },
    [enabled, args.feature?.getSubRows, args.feature?.loadChildren, args.getRowId, childrenById],
  )

  useEffect(() => {
    if (!enabled) return
    const depth = args.feature?.defaultExpandedDepth
    const ids = args.feature?.defaultExpandedRowIds
    if (depth == null && (!ids || ids.length === 0)) return
    setExpanded((prev) => {
      if (prev === true) return prev
      if (Object.keys(prev).length > 0) return prev
      const base =
        depth == null
          ? {}
          : buildExpandedFromDepth({ rows: args.rows, getRowId: args.getRowId, getSubRows, depth })
      return mergeExpandedState(base, ids)
    })
  }, [
    enabled,
    args.feature?.defaultExpandedDepth,
    args.feature?.defaultExpandedRowIds,
    args.getRowId,
    args.rows,
    getSubRows,
  ])

  const rowIndex = useMemo(() => {
    const map = new Map<string, TData>()
    const walk = (rows: TData[], parentId: string | null) => {
      rows.forEach((row, index) => {
        const rowId = buildRowId({ row, index, parentId, getRowId: args.getRowId })
        map.set(rowId, row)
        const children = getSubRows(row)
        if (children && children.length > 0) {
          walk(children, rowId)
        }
      })
    }
    walk(args.rows, null)
    return map
  }, [args.rows, args.getRowId, getSubRows])

  const ensureLoaded = useStableCallback(async (rowId: string) => {
    if (!enabled) return
    if (!args.feature?.loadChildren) return
    if (!args.getRowId) return
    if (childrenById[rowId]) return
    if (loadingRowIds.has(rowId)) return
    const row = rowIndex.get(rowId)
    if (!row) return

    setLoadingRowIds((prev) => new Set(prev).add(rowId))
    try {
      const children = await args.feature.loadChildren(row)
      setChildrenById((prev) => ({ ...prev, [rowId]: children }))
      if (children.length === 0) {
        setExpanded((prev) => {
          if (prev === true) return prev
          if (!prev[rowId]) return prev
          const next = { ...prev }
          delete next[rowId]
          return next
        })
      }
    } finally {
      setLoadingRowIds((prev) => {
        const next = new Set(prev)
        next.delete(rowId)
        return next
      })
    }
  })

  const isExpanded = useStableCallback((rowId: string) => {
    const state = expandedRef.current
    if (state === true) return true
    return Boolean(state[rowId])
  })

  const expandRow = useStableCallback((rowId: string) => {
    if (!enabled) return
    if (!isExpanded(rowId)) {
      setExpanded((prev) => ({ ...(prev === true ? {} : prev), [rowId]: true }))
    }
    void ensureLoaded(rowId)
  })

  const collapseRow = useStableCallback((rowId: string) => {
    if (!enabled) return
    setExpanded((prev) => {
      if (prev === true) return {}
      const next = { ...prev }
      delete next[rowId]
      return next
    })
  })

  const toggleRowExpanded = useStableCallback((rowId: string) => {
    if (!enabled) return
    const nextExpanded = !isExpanded(rowId)
    setExpanded((prev) => {
      if (prev === true) return {}
      if (!nextExpanded) {
        const next = { ...prev }
        delete next[rowId]
        return next
      }
      return { ...prev, [rowId]: true }
    })
    if (nextExpanded) {
      void ensureLoaded(rowId)
    }
  })

  const expandAll = useStableCallback(() => {
    if (!enabled) return
    setExpanded(true)
  })

  const collapseAll = useStableCallback(() => {
    if (!enabled) return
    setExpanded({})
  })

  const expandToDepth = useStableCallback((depth: number) => {
    if (!enabled) return
    if (depth <= 0) {
      collapseAll()
      return
    }
    const next = buildExpandedFromDepth({
      rows: args.rows,
      getRowId: args.getRowId,
      getSubRows,
      depth,
    })
    setExpanded(next)
  })

  const runtime: DataTableFeatureRuntime<TData, TFilterSchema> = useStableObject({
    patchTableOptions: () => {
      if (!enabled) return {}
      const getRowCanExpand = args.feature?.getRowCanExpand
        ? args.feature.getRowCanExpand
        : args.feature?.getSubRows
          ? (row: TData) => {
              const children = args.feature?.getSubRows?.(row)
              return Boolean(children && children.length > 0)
            }
          : args.feature?.loadChildren
            ? (row: TData) => {
                if (!args.getRowId) return true
                const rowId = args.getRowId(row)
                const loadedChildren = childrenById[rowId]
                if (!loadedChildren) return true
                return loadedChildren.length > 0
              }
            : undefined
      return {
        enableExpanding: true,
        getExpandedRowModel: getExpandedRowModel(),
        getSubRows,
        ...(getRowCanExpand ? { getRowCanExpand } : {}),
        enableSubRowSelection: selectionBehavior === "cascade",
        meta: {
          dtTreeIndentSize: indentSize,
          dtTreeAllowNesting: allowNesting,
        },
        state: {
          expanded,
        },
        onExpandedChange: setExpanded,
      }
    },
    patchActions: (_actions: DataTableActions) => {
      if (!enabled) return {}
      return {
        expandRow,
        collapseRow,
        toggleRowExpanded,
        expandAll,
        collapseAll,
        expandToDepth,
      }
    },
    onReset: () => {
      if (!enabled) return
      collapseAll()
      setChildrenById({})
      setLoadingRowIds(new Set())
    },
  })

  const expandedRowIds = useMemo(() => {
    if (!enabled) return []
    if (expanded === true) {
      return Array.from(rowIndex.keys())
    }
    return Object.keys(expanded).filter((key) => expanded[key])
  }, [enabled, expanded, rowIndex])

  const tree: DataTableTree = useStableObject(
    useMemo(
      () => ({
        enabled,
        expandedRowIds,
        loadingRowIds: Array.from(loadingRowIds),
      }),
      [enabled, expandedRowIds, loadingRowIds],
    ),
  )

  const expandedRowIdsRef = useRef<string[]>([])
  useEffect(() => {
    if (!enabled) return
    if (!args.feature?.loadChildren) return
    const prev = new Set(expandedRowIdsRef.current)
    for (const rowId of expandedRowIds) {
      if (prev.has(rowId)) continue
      void ensureLoaded(rowId)
    }
    expandedRowIdsRef.current = expandedRowIds
  }, [enabled, args.feature?.loadChildren, expandedRowIds, ensureLoaded])

  return {
    tree,
    runtime,
    getSubRows: enabled ? getSubRows : undefined,
  }
}
