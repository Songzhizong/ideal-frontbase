import type { Row } from "@tanstack/react-table"
import type { ReactNode } from "react"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function getMetaClass(
  meta: unknown,
  key: "headerClassName" | "cellClassName",
): string | undefined {
  if (!isRecord(meta)) return undefined
  const value = meta[key]
  return typeof value === "string" && value.trim() !== "" ? value : undefined
}

function normalizeAlign(value: unknown): "left" | "center" | "right" | undefined {
  if (value === "left" || value === "center" || value === "right") {
    return value
  }
  return undefined
}

export function getMetaAlign(
  meta: unknown,
  target: "header" | "cell",
): "left" | "center" | "right" {
  if (!isRecord(meta)) return "left"
  const specificKey = target === "header" ? "headerAlign" : "cellAlign"
  const specificAlign = normalizeAlign(meta[specificKey])
  if (specificAlign) return specificAlign
  return normalizeAlign(meta.align) ?? "left"
}

export function getDensity(meta: unknown): "compact" | "comfortable" {
  if (!isRecord(meta)) return "comfortable"
  return meta.dtDensity === "compact" ? "compact" : "comfortable"
}

export function getTreeIndentSize(meta: unknown): number {
  if (!isRecord(meta)) return 24
  const value = meta.dtTreeIndentSize
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 24
}

export function getTreeAllowNesting(meta: unknown): boolean {
  if (!isRecord(meta)) return false
  return meta.dtTreeAllowNesting === true
}

export function getParentRowId<TData>(row: Row<TData>): string | null {
  const parent = row.getParentRow()
  return parent ? parent.id : null
}

export function isDescendantRow<TData>(row: Row<TData>, ancestorId: string): boolean {
  let current = row.getParentRow()
  while (current) {
    if (current.id === ancestorId) return true
    current = current.getParentRow()
  }
  return false
}

export type DragSortOverlayMode = "row" | "ghost" | "minimal"
export type DragSortDropPosition = "above" | "below" | "inside"

export interface TableDragSortMeta {
  handle: boolean
  overlay: DragSortOverlayMode
  allowNesting: boolean
  canDrag: ((row: unknown) => boolean) | null
  canDrop: ((activeRow: unknown, overRow: unknown) => boolean) | null
  onDragStart: ((rowId: string) => void) | null
  onDragEnd:
    | ((args: {
        activeId: string
        overId: string | null
        position?: DragSortDropPosition
      }) => void | Promise<void>)
    | null
  onDragCancel: (() => void) | null
  error: unknown | null
  clearError: (() => void) | null
}

export interface TableVirtualizationMeta {
  enabled: boolean
  mode: "windowed" | "infinite"
  rowHeight: number
  overscan: number
  loadMore: (() => void | Promise<void>) | null
  loadMoreOffset: number
}

export interface TableAnalyticsMeta<TData> {
  enabled: boolean
  groupBy: ((row: TData) => string) | null
  groupLabel: ((args: { group: string; count: number }) => string) | null
  summary: {
    label: string
    labelColumnId: string | null
    values: Record<string, (rows: TData[]) => ReactNode>
  } | null
}

export function getDragSortMeta(meta: unknown): TableDragSortMeta {
  if (!isRecord(meta)) {
    return {
      handle: true,
      overlay: "row",
      allowNesting: false,
      canDrag: null,
      canDrop: null,
      onDragStart: null,
      onDragEnd: null,
      onDragCancel: null,
      error: null,
      clearError: null,
    }
  }
  const handleValue = meta.dtDragSortHandle
  const overlayValue = meta.dtDragSortOverlay
  const allowNestingValue = meta.dtDragSortAllowNesting
  const canDragValue = meta.dtDragSortCanDrag
  const canDropValue = meta.dtDragSortCanDrop
  const onDragStartValue = meta.dtDragSortOnDragStart
  const onDragEndValue = meta.dtDragSortOnDragEnd
  const onDragCancelValue = meta.dtDragSortOnDragCancel
  const errorValue = meta.dtDragSortError
  const clearErrorValue = meta.dtDragSortClearError

  return {
    handle: typeof handleValue === "boolean" ? handleValue : true,
    overlay:
      overlayValue === "ghost" || overlayValue === "minimal" || overlayValue === "row"
        ? overlayValue
        : "row",
    allowNesting: typeof allowNestingValue === "boolean" ? allowNestingValue : false,
    canDrag:
      typeof canDragValue === "function" ? (canDragValue as (row: unknown) => boolean) : null,
    canDrop:
      typeof canDropValue === "function"
        ? (canDropValue as (activeRow: unknown, overRow: unknown) => boolean)
        : null,
    onDragStart:
      typeof onDragStartValue === "function" ? (onDragStartValue as (rowId: string) => void) : null,
    onDragEnd:
      typeof onDragEndValue === "function"
        ? (onDragEndValue as (args: {
            activeId: string
            overId: string | null
            position?: DragSortDropPosition
          }) => void | Promise<void>)
        : null,
    onDragCancel:
      typeof onDragCancelValue === "function" ? (onDragCancelValue as () => void) : null,
    error: errorValue ?? null,
    clearError: typeof clearErrorValue === "function" ? (clearErrorValue as () => void) : null,
  }
}

export function getVirtualizationMeta(meta: unknown): TableVirtualizationMeta {
  if (!isRecord(meta)) {
    return {
      enabled: false,
      mode: "windowed",
      rowHeight: 44,
      overscan: 6,
      loadMore: null,
      loadMoreOffset: 176,
    }
  }
  const enabled = meta.dtVirtualizationEnabled === true
  const mode = meta.dtVirtualizationMode === "infinite" ? "infinite" : "windowed"
  const rowHeightValue = meta.dtVirtualizationRowHeight
  const overscanValue = meta.dtVirtualizationOverscan
  const loadMoreValue = meta.dtVirtualizationLoadMore
  const loadMoreOffsetValue = meta.dtVirtualizationLoadMoreOffset
  const rowHeight =
    typeof rowHeightValue === "number" && Number.isFinite(rowHeightValue) && rowHeightValue >= 24
      ? rowHeightValue
      : 44
  const overscan =
    typeof overscanValue === "number" && Number.isFinite(overscanValue) && overscanValue >= 0
      ? Math.floor(overscanValue)
      : 6
  const loadMoreOffset =
    typeof loadMoreOffsetValue === "number" &&
    Number.isFinite(loadMoreOffsetValue) &&
    loadMoreOffsetValue >= 0
      ? loadMoreOffsetValue
      : rowHeight * 4

  return {
    enabled,
    mode,
    rowHeight,
    overscan,
    loadMore:
      typeof loadMoreValue === "function" ? (loadMoreValue as () => void | Promise<void>) : null,
    loadMoreOffset,
  }
}

export function getAnalyticsMeta<TData>(meta: unknown): TableAnalyticsMeta<TData> {
  if (!isRecord(meta) || meta.dtAnalyticsEnabled !== true) {
    return {
      enabled: false,
      groupBy: null,
      groupLabel: null,
      summary: null,
    }
  }

  const groupByValue = meta.dtAnalyticsGroupBy
  const groupLabelValue = meta.dtAnalyticsGroupLabel
  const summaryLabelValue = meta.dtAnalyticsSummaryLabel
  const summaryLabelColumnIdValue = meta.dtAnalyticsSummaryLabelColumnId
  const summaryValuesValue = meta.dtAnalyticsSummaryValues

  const summaryValues: Record<string, (rows: TData[]) => ReactNode> = {}
  if (isRecord(summaryValuesValue)) {
    for (const [key, value] of Object.entries(summaryValuesValue)) {
      if (typeof value === "function") {
        summaryValues[key] = value as (rows: TData[]) => ReactNode
      }
    }
  }

  const hasSummaryValues = Object.keys(summaryValues).length > 0

  return {
    enabled: true,
    groupBy: typeof groupByValue === "function" ? (groupByValue as (row: TData) => string) : null,
    groupLabel:
      typeof groupLabelValue === "function"
        ? (groupLabelValue as (args: { group: string; count: number }) => string)
        : null,
    summary: hasSummaryValues
      ? {
          label: typeof summaryLabelValue === "string" ? summaryLabelValue : "汇总",
          labelColumnId:
            typeof summaryLabelColumnIdValue === "string" ? summaryLabelColumnIdValue : null,
          values: summaryValues,
        }
      : null,
  }
}

export function getErrorMessage(error: unknown, fallbackText: string): string {
  if (error instanceof Error && error.message.trim() !== "") {
    return `${fallbackText}：${error.message}`
  }
  if (typeof error === "string" && error.trim() !== "") {
    return `${fallbackText}：${error}`
  }
  return fallbackText
}
