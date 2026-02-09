import type { RowSelectionState } from "@tanstack/react-table"
import type { CrossPageSelection } from "../types"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function stableStructure(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === "bigint") return value.toString()
  if (Array.isArray(value)) return value.map(stableStructure)
  if (!isRecord(value)) return value
  const keys = Object.keys(value).sort()
  const next: Record<string, unknown> = {}
  for (const key of keys) {
    next[key] = stableStructure(value[key])
  }
  return next
}

export function stableSerialize(value: unknown): string {
  try {
    return JSON.stringify(stableStructure(value))
  } catch {
    return ""
  }
}

function buildRowIds<TData>(rows: TData[], getRowId?: (row: TData) => string): string[] {
  if (getRowId) return rows.map((row) => getRowId(row))
  return rows.map((_, index) => String(index))
}

export function buildScopedRowIds<TData>(args: {
  rows: TData[]
  getRowId: ((row: TData) => string) | undefined
  getSubRows: ((row: TData) => TData[] | undefined) | undefined
}): string[] {
  if (!args.getSubRows) {
    return buildRowIds(args.rows, args.getRowId)
  }
  const ids: string[] = []
  const walk = (rows: TData[], parentId: string | null) => {
    rows.forEach((row, index) => {
      const rowId = args.getRowId
        ? args.getRowId(row)
        : parentId
          ? `${parentId}.${index}`
          : String(index)
      ids.push(rowId)
      const children = args.getSubRows?.(row)
      if (children && children.length > 0) {
        walk(children, rowId)
      }
    })
  }
  walk(args.rows, null)
  return ids
}

export function buildAllSelectedState(rowIds: string[], maxSelection?: number): RowSelectionState {
  const next: RowSelectionState = {}
  const limit = maxSelection == null ? rowIds.length : Math.max(0, maxSelection)
  for (let index = 0; index < rowIds.length && index < limit; index += 1) {
    const rowId = rowIds[index]
    if (!rowId) continue
    next[rowId] = true
  }
  return next
}

export function getSelectedIds(state: RowSelectionState): Set<string> {
  const selected = new Set<string>()
  for (const [key, value] of Object.entries(state)) {
    if (value) selected.add(key)
  }
  return selected
}

export function deriveRowSelectionFromCrossPage(args: {
  rowIds: string[]
  selection: CrossPageSelection
}): RowSelectionState {
  const next: RowSelectionState = {}
  if (args.selection.mode === "include") {
    for (const rowId of args.rowIds) {
      if (args.selection.rowIds.has(rowId)) {
        next[rowId] = true
      }
    }
    return next
  }
  for (const rowId of args.rowIds) {
    if (!args.selection.rowIds.has(rowId)) {
      next[rowId] = true
    }
  }
  return next
}

function applyIncludeMaxSelection(args: {
  currentPageRowIds: string[]
  prevCrossPage: Set<string>
  nextRowSelection: RowSelectionState
  maxSelection: number
}): { nextCrossPage: Set<string>; adjustedRowSelection: RowSelectionState } {
  const desiredSelected = getSelectedIds(args.nextRowSelection)
  const nextCrossPage = new Set(args.prevCrossPage)

  for (const rowId of args.currentPageRowIds) {
    if (args.prevCrossPage.has(rowId) && !desiredSelected.has(rowId)) {
      nextCrossPage.delete(rowId)
    }
  }

  const remainingCapacity = Math.max(0, args.maxSelection - nextCrossPage.size)
  let additions = 0
  for (const rowId of args.currentPageRowIds) {
    if (args.prevCrossPage.has(rowId)) continue
    if (!desiredSelected.has(rowId)) continue
    if (additions >= remainingCapacity) break
    nextCrossPage.add(rowId)
    additions += 1
  }

  const adjustedRowSelection: RowSelectionState = {}
  for (const rowId of args.currentPageRowIds) {
    if (nextCrossPage.has(rowId)) {
      adjustedRowSelection[rowId] = true
    }
  }

  return { nextCrossPage, adjustedRowSelection }
}

export function updateCrossPageSelection(args: {
  prev: CrossPageSelection
  currentPageRowIds: string[]
  nextRowSelection: RowSelectionState
  maxSelection: number | undefined
}): { selection: CrossPageSelection; adjustedRowSelection?: RowSelectionState } {
  if (args.prev.mode === "exclude") {
    const desiredSelected = getSelectedIds(args.nextRowSelection)
    const nextExcluded = new Set(args.prev.rowIds)
    for (const rowId of args.currentPageRowIds) {
      if (desiredSelected.has(rowId)) {
        nextExcluded.delete(rowId)
      } else {
        nextExcluded.add(rowId)
      }
    }
    return {
      selection: {
        mode: "exclude",
        rowIds: nextExcluded,
      },
    }
  }

  const maxSelection = args.maxSelection
  if (maxSelection != null && Number.isFinite(maxSelection) && maxSelection >= 0) {
    const { nextCrossPage, adjustedRowSelection } = applyIncludeMaxSelection({
      currentPageRowIds: args.currentPageRowIds,
      prevCrossPage: args.prev.rowIds,
      nextRowSelection: args.nextRowSelection,
      maxSelection,
    })
    return {
      selection: {
        mode: "include",
        rowIds: nextCrossPage,
      },
      adjustedRowSelection,
    }
  }

  const desiredSelected = getSelectedIds(args.nextRowSelection)
  const nextIncluded = new Set(args.prev.rowIds)
  for (const rowId of args.currentPageRowIds) {
    if (desiredSelected.has(rowId)) {
      nextIncluded.add(rowId)
    } else {
      nextIncluded.delete(rowId)
    }
  }
  return {
    selection: {
      mode: "include",
      rowIds: nextIncluded,
    },
  }
}

export function computeCrossPageMeta(args: {
  selection: CrossPageSelection
  total: number | undefined
}): {
  totalSelected: number | "all"
  isAllSelected: boolean
} {
  if (args.selection.mode === "exclude") {
    if (typeof args.total === "number") {
      const totalSelected = Math.max(0, args.total - args.selection.rowIds.size)
      return { totalSelected, isAllSelected: true }
    }
    return { totalSelected: "all", isAllSelected: true }
  }
  if (
    typeof args.total === "number" &&
    args.total > 0 &&
    args.selection.rowIds.size >= args.total
  ) {
    return { totalSelected: args.total, isAllSelected: true }
  }
  return { totalSelected: args.selection.rowIds.size, isAllSelected: false }
}
