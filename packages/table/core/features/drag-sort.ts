import { useMemo, useState } from "react"
import type { DataTableDragSort, DataTableFeatureRuntime, DragSortFeatureOptions } from "../types"
import { useStableCallback, useStableObject } from "../utils/reference-stability"

function isFeatureEnabled(feature?: { enabled?: boolean }): boolean {
  if (!feature) return false
  return feature.enabled !== false
}

type DragSortDropPosition = "above" | "below" | "inside"

function arrayMove<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex) return items
  const next = items.slice()
  const [moved] = next.splice(fromIndex, 1)
  if (moved === undefined) return items
  next.splice(toIndex, 0, moved)
  return next
}

interface IndexedRow<TData> {
  id: string
  row: TData
  parentId: string | null
  indexInParent: number
}

function buildRowIndex<TData>(args: {
  rows: TData[]
  getRowId: (row: TData) => string
  getSubRows: ((row: TData) => TData[] | undefined) | undefined
}): {
  byId: Map<string, IndexedRow<TData>>
  childrenByParentId: Map<string | null, string[]>
} {
  const byId = new Map<string, IndexedRow<TData>>()
  const childrenByParentId = new Map<string | null, string[]>()

  const walk = (rows: TData[], parentId: string | null) => {
    const childIds: string[] = []
    rows.forEach((row, index) => {
      const id = args.getRowId(row)
      childIds.push(id)
      byId.set(id, {
        id,
        row,
        parentId,
        indexInParent: index,
      })
      const children = args.getSubRows?.(row)
      if (children && children.length > 0) {
        walk(children, id)
      }
    })
    childrenByParentId.set(parentId, childIds)
  }

  walk(args.rows, null)
  return { byId, childrenByParentId }
}

function isAncestor<TData>(args: {
  ancestorId: string
  nodeId: string
  byId: Map<string, IndexedRow<TData>>
}): boolean {
  let current = args.byId.get(args.nodeId)?.parentId ?? null
  while (current) {
    if (current === args.ancestorId) return true
    current = args.byId.get(current)?.parentId ?? null
  }
  return false
}

function adjustTargetIndex(args: {
  activeParentId: string | null
  activeIndexInParent: number
  targetParentId: string | null
  targetIndex: number
}): number {
  if (args.activeParentId !== args.targetParentId) return args.targetIndex
  if (args.activeIndexInParent < args.targetIndex) return Math.max(0, args.targetIndex - 1)
  return args.targetIndex
}

export function useDragSortFeature<TData, TFilterSchema>(args: {
  feature: DragSortFeatureOptions<TData> | undefined
  getRowId: ((row: TData) => string) | undefined
  getSubRows: ((row: TData) => TData[] | undefined) | undefined
  rows: TData[]
}): {
  dragSort: DataTableDragSort
  runtime: DataTableFeatureRuntime<TData, TFilterSchema>
} {
  const enabled = isFeatureEnabled(args.feature)
  const handle = args.feature?.handle ?? true
  const dragOverlay = args.feature?.dragOverlay ?? "row"
  const allowNesting = args.feature?.allowNesting ?? false

  if (enabled && !args.getRowId) {
    throw new Error("DragSort feature: 需要提供 getRowId")
  }

  const [isDragging, setIsDragging] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [lastError, setLastError] = useState<unknown | null>(null)

  const moveRowWithDrop = useStableCallback(
    async (params: { activeId: string; overId: string; position: DragSortDropPosition }) => {
      if (!enabled) return
      if (!args.getRowId) return
      if (params.activeId === params.overId) return

      const index = buildRowIndex({
        rows: args.rows,
        getRowId: args.getRowId,
        getSubRows: args.getSubRows,
      })
      const activeNode = index.byId.get(params.activeId)
      const overNode = index.byId.get(params.overId)
      if (!activeNode || !overNode) return

      if (args.feature?.canDrag && !args.feature.canDrag(activeNode.row)) return

      const treeEnabled = Boolean(args.getSubRows)
      const allowNestingEnabled = treeEnabled && allowNesting
      const position: DragSortDropPosition =
        allowNestingEnabled && params.position === "inside"
          ? "inside"
          : params.position === "inside"
            ? "below"
            : params.position

      if (treeEnabled && !allowNestingEnabled) {
        if (activeNode.parentId !== overNode.parentId) return
      }

      const targetParentId =
        allowNestingEnabled && position === "inside" ? overNode.id : overNode.parentId

      if (treeEnabled && targetParentId != null) {
        if (targetParentId === activeNode.id) return
        if (isAncestor({ ancestorId: activeNode.id, nodeId: targetParentId, byId: index.byId }))
          return
      }

      let targetIndex: number
      if (position === "inside") {
        targetIndex = index.childrenByParentId.get(overNode.id)?.length ?? 0
      } else if (position === "below") {
        targetIndex = overNode.indexInParent + 1
      } else {
        targetIndex = overNode.indexInParent
      }

      const adjustedTargetIndex = adjustTargetIndex({
        activeParentId: activeNode.parentId,
        activeIndexInParent: activeNode.indexInParent,
        targetParentId,
        targetIndex,
      })

      if (
        activeNode.parentId === targetParentId &&
        adjustedTargetIndex === activeNode.indexInParent
      ) {
        return
      }

      if (args.feature?.canDrop && !args.feature.canDrop(activeNode.row, overNode.row)) return

      const payloadBase = {
        activeId: params.activeId,
        overId: params.overId,
        activeIndex: activeNode.indexInParent,
        overIndex: overNode.indexInParent,
        activeRow: activeNode.row,
        overRow: overNode.row,
        dropPosition: position,
        activeParentId: activeNode.parentId,
        overParentId: overNode.parentId,
        targetParentId,
        targetIndex: adjustedTargetIndex,
      } satisfies Parameters<DragSortFeatureOptions<TData>["onReorder"]>[0]

      if (activeNode.parentId === null && targetParentId === null) {
        const reorderedRows = arrayMove(args.rows, activeNode.indexInParent, adjustedTargetIndex)
        try {
          await args.feature?.onReorder({
            ...payloadBase,
            reorderedRows,
          })
        } catch (error) {
          setLastError(error)
          args.feature?.onError?.({
            error,
            activeId: params.activeId,
            overId: params.overId,
            dropPosition: position,
          })
        }
        return
      }

      try {
        await args.feature?.onReorder(payloadBase)
      } catch (error) {
        setLastError(error)
        args.feature?.onError?.({
          error,
          activeId: params.activeId,
          overId: params.overId,
          dropPosition: position,
        })
      }
    },
  )

  const moveRow = useStableCallback(async (activeRowId: string, overRowId: string) => {
    if (!enabled) return
    await moveRowWithDrop({ activeId: activeRowId, overId: overRowId, position: "above" })
  })

  const onDragStart = useStableCallback((rowId: string) => {
    if (!enabled) return
    setLastError(null)
    setIsDragging(true)
    setActiveId(rowId)
  })

  const onDragCancel = useStableCallback(() => {
    if (!enabled) return
    setIsDragging(false)
    setActiveId(null)
  })

  const clearDragSortError = useStableCallback(() => {
    if (!enabled) return
    setLastError(null)
  })

  const onDragEnd = useStableCallback(
    async (args: { activeId: string; overId: string | null; position?: DragSortDropPosition }) => {
      if (!enabled) return
      setIsDragging(false)
      setActiveId(null)
      if (!args.overId) return
      await moveRowWithDrop({
        activeId: args.activeId,
        overId: args.overId,
        position: args.position ?? "above",
      })
    },
  )

  const dragSort: DataTableDragSort = useStableObject(
    useMemo(
      () => ({
        enabled,
        isDragging,
        activeId,
      }),
      [enabled, isDragging, activeId],
    ),
  )

  const runtime: DataTableFeatureRuntime<TData, TFilterSchema> = useStableObject({
    patchTableOptions: () => {
      if (!enabled) return {}
      return {
        meta: {
          dtDragSortHandle: handle,
          dtDragSortOverlay: dragOverlay,
          dtDragSortAllowNesting: allowNesting,
          dtDragSortCanDrag: args.feature?.canDrag,
          dtDragSortCanDrop: args.feature?.canDrop,
          dtDragSortOnDragStart: onDragStart,
          dtDragSortOnDragEnd: onDragEnd,
          dtDragSortOnDragCancel: onDragCancel,
          dtDragSortError: lastError,
          dtDragSortClearError: clearDragSortError,
        },
      }
    },
    patchActions: () => {
      if (!enabled) return {}
      return {
        moveRow,
      }
    },
    onReset: () => {
      if (!enabled) return
      onDragCancel()
      clearDragSortError()
    },
  })

  return { dragSort, runtime }
}
