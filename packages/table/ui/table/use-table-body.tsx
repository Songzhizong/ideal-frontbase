import type { Row } from "@tanstack/react-table"
import type React from "react"
import { type ReactElement, type ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { TableCell, TableRow } from "@/packages/ui/table"
import { cn } from "@/packages/ui-utils"
import type { TableAnalyticsMeta, TableVirtualizationMeta } from "./helpers"

const LOAD_MORE_COOLDOWN_MS = 300

export function useTableBodyRows<TData>(args: {
  rows: Array<Row<TData>>
  colSpan: number
  rowClassName: string
  cellDensityClass: string
  canVirtualize: boolean
  wrapperRef: React.RefObject<HTMLDivElement | null>
  virtualizationMeta: TableVirtualizationMeta
  analyticsMeta: TableAnalyticsMeta<TData>
  renderDataRow: (row: Row<TData>) => ReactElement[]
  visibleLeafColumns: Array<{ id: string }>
}): {
  groupedRows: ReactElement[] | null
  virtualizedRows: ReactElement[] | null
  summaryCells: ReactNode[] | null
} {
  const [virtualWindow, setVirtualWindow] = useState(() => ({
    start: 0,
    end: args.rows.length,
  }))
  const loadingMoreRef = useRef(false)
  const lastLoadMoreRef = useRef<{ at: number; rowCount: number; scrollTop: number } | null>(null)

  useEffect(() => {
    if (!args.canVirtualize) {
      loadingMoreRef.current = false
      lastLoadMoreRef.current = null
      setVirtualWindow((prev) =>
        prev.start === 0 && prev.end === args.rows.length
          ? prev
          : { start: 0, end: args.rows.length },
      )
      return
    }
    const root = args.wrapperRef.current
    if (!root) return

    const rowCount = args.rows.length
    const rowHeight = args.virtualizationMeta.rowHeight
    const overscan = args.virtualizationMeta.overscan

    const updateWindow = () => {
      const viewportHeight = root.clientHeight
      const scrollTop = root.scrollTop
      const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
      const end = Math.min(rowCount, Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan)
      setVirtualWindow((prev) => (prev.start === start && prev.end === end ? prev : { start, end }))

      if (
        args.virtualizationMeta.mode === "infinite" &&
        args.virtualizationMeta.loadMore &&
        !loadingMoreRef.current
      ) {
        const totalHeight = rowCount * rowHeight
        if (scrollTop + viewportHeight >= totalHeight - args.virtualizationMeta.loadMoreOffset) {
          const now = Date.now()
          const last = lastLoadMoreRef.current
          const passedCooldown = !last || now - last.at >= LOAD_MORE_COOLDOWN_MS
          const rowCountIncreased = !last || rowCount > last.rowCount
          const movedDownEnough = !last || scrollTop > last.scrollTop + rowHeight / 2
          if (!passedCooldown || (!rowCountIncreased && !movedDownEnough)) {
            return
          }
          loadingMoreRef.current = true
          lastLoadMoreRef.current = {
            at: now,
            rowCount,
            scrollTop,
          }
          Promise.resolve(args.virtualizationMeta.loadMore()).finally(() => {
            loadingMoreRef.current = false
          })
        }
      }
    }

    updateWindow()
    root.addEventListener("scroll", updateWindow, { passive: true })
    window.addEventListener("resize", updateWindow)
    return () => {
      root.removeEventListener("scroll", updateWindow)
      window.removeEventListener("resize", updateWindow)
    }
  }, [
    args.canVirtualize,
    args.rows.length,
    args.wrapperRef,
    args.virtualizationMeta.rowHeight,
    args.virtualizationMeta.overscan,
    args.virtualizationMeta.mode,
    args.virtualizationMeta.loadMore,
    args.virtualizationMeta.loadMoreOffset,
  ])

  const groupedRows = useMemo(() => {
    if (!args.analyticsMeta.groupBy) return null
    const groups = new Map<string, Array<Row<TData>>>()
    for (const row of args.rows) {
      const key = args.analyticsMeta.groupBy(row.original as TData)
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)?.push(row)
    }
    return Array.from(groups.entries()).flatMap(([group, rows]) => {
      const label = args.analyticsMeta.groupLabel
        ? args.analyticsMeta.groupLabel({ group, count: rows.length })
        : `${group} (${rows.length})`
      const rowsWithHeader: ReactElement[] = [
        <TableRow
          key={`__group__${group}`}
          className={cn(args.rowClassName, "bg-muted/30 hover:bg-muted/40")}
        >
          <TableCell
            colSpan={args.colSpan}
            className={cn("text-xs font-medium text-muted-foreground", args.cellDensityClass)}
          >
            {label}
          </TableCell>
        </TableRow>,
      ]
      rowsWithHeader.push(...rows.flatMap((row) => args.renderDataRow(row)))
      return rowsWithHeader
    })
  }, [
    args.analyticsMeta.groupBy,
    args.analyticsMeta.groupLabel,
    args.rows,
    args.rowClassName,
    args.colSpan,
    args.cellDensityClass,
    args.renderDataRow,
  ])

  const virtualizedRows = useMemo(() => {
    if (!args.canVirtualize) return null
    const totalRows = args.rows.length
    const start = Math.min(totalRows, virtualWindow.start)
    const end = Math.min(totalRows, Math.max(start, virtualWindow.end))
    const topSpacerHeight = start * args.virtualizationMeta.rowHeight
    const bottomSpacerHeight = Math.max(0, (totalRows - end) * args.virtualizationMeta.rowHeight)
    const visibleRows = args.rows.slice(start, end).flatMap((row) => args.renderDataRow(row))

    const spacerRows: ReactElement[] = []
    if (topSpacerHeight > 0) {
      spacerRows.push(
        <TableRow key="__virtual_top__" className={cn(args.rowClassName, "hover:bg-transparent")}>
          <TableCell
            colSpan={args.colSpan}
            style={{ height: `${topSpacerHeight}px` }}
            className="p-0"
          />
        </TableRow>,
      )
    }
    if (bottomSpacerHeight > 0) {
      spacerRows.push(
        <TableRow
          key="__virtual_bottom__"
          className={cn(args.rowClassName, "hover:bg-transparent")}
        >
          <TableCell
            colSpan={args.colSpan}
            style={{ height: `${bottomSpacerHeight}px` }}
            className="p-0"
          />
        </TableRow>,
      )
    }

    if (spacerRows.length === 0) return visibleRows
    if (spacerRows.length === 1 && topSpacerHeight > 0) return [...spacerRows, ...visibleRows]
    if (spacerRows.length === 1) return [...visibleRows, ...spacerRows]
    return [spacerRows[0] as ReactElement, ...visibleRows, spacerRows[1] as ReactElement]
  }, [
    args.canVirtualize,
    args.rows,
    args.virtualizationMeta.rowHeight,
    args.rowClassName,
    args.colSpan,
    args.renderDataRow,
    virtualWindow.end,
    virtualWindow.start,
  ])

  const summaryCells = useMemo(() => {
    if (!args.analyticsMeta.summary) return null
    const rows = args.rows.map((row) => row.original as TData)
    const values = args.analyticsMeta.summary.values
    const labelColumnId =
      args.analyticsMeta.summary.labelColumnId ?? args.visibleLeafColumns[0]?.id ?? null
    return args.visibleLeafColumns.map((column) => {
      const valueGetter = values[column.id]
      if (valueGetter) return valueGetter(rows)
      if (column.id === labelColumnId) return args.analyticsMeta.summary?.label ?? "汇总"
      return null
    })
  }, [args.analyticsMeta.summary, args.rows, args.visibleLeafColumns])

  return {
    groupedRows,
    virtualizedRows,
    summaryCells,
  }
}
