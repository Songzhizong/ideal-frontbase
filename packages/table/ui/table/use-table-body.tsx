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
  const {
    rows,
    colSpan,
    rowClassName,
    cellDensityClass,
    canVirtualize,
    wrapperRef,
    virtualizationMeta,
    analyticsMeta,
    renderDataRow,
    visibleLeafColumns,
  } = args
  const { rowHeight, overscan, mode, loadMore, loadMoreOffset } = virtualizationMeta
  const { groupBy, groupLabel, summary } = analyticsMeta

  const [virtualWindow, setVirtualWindow] = useState(() => ({
    start: 0,
    end: rows.length,
  }))
  const loadingMoreRef = useRef(false)
  const lastLoadMoreRef = useRef<{ at: number; rowCount: number; scrollTop: number } | null>(null)

  useEffect(() => {
    if (!canVirtualize) {
      loadingMoreRef.current = false
      lastLoadMoreRef.current = null
      setVirtualWindow((prev) =>
        prev.start === 0 && prev.end === rows.length ? prev : { start: 0, end: rows.length },
      )
      return
    }
    const root = wrapperRef.current
    if (!root) return

    const rowCount = rows.length

    const updateWindow = () => {
      const viewportHeight = root.clientHeight
      const scrollTop = root.scrollTop
      const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
      const end = Math.min(rowCount, Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan)
      setVirtualWindow((prev) => (prev.start === start && prev.end === end ? prev : { start, end }))

      if (mode === "infinite" && loadMore && !loadingMoreRef.current) {
        const totalHeight = rowCount * rowHeight
        if (scrollTop + viewportHeight >= totalHeight - loadMoreOffset) {
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
          Promise.resolve(loadMore()).finally(() => {
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
  }, [canVirtualize, rows.length, wrapperRef, rowHeight, overscan, mode, loadMore, loadMoreOffset])

  const groupedRows = useMemo(() => {
    if (!groupBy) return null
    const groups = new Map<string, Array<Row<TData>>>()
    for (const row of rows) {
      const key = groupBy(row.original as TData)
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)?.push(row)
    }
    return Array.from(groups.entries()).flatMap(([group, rows]) => {
      const label = groupLabel
        ? groupLabel({ group, count: rows.length })
        : `${group} (${rows.length})`
      const rowsWithHeader: ReactElement[] = [
        <TableRow
          key={`__group__${group}`}
          className={cn(rowClassName, "bg-muted/30 hover:bg-muted/40")}
        >
          <TableCell
            colSpan={colSpan}
            className={cn("text-xs font-medium text-muted-foreground", cellDensityClass)}
          >
            {label}
          </TableCell>
        </TableRow>,
      ]
      rowsWithHeader.push(...rows.flatMap((row) => renderDataRow(row)))
      return rowsWithHeader
    })
  }, [groupBy, groupLabel, rows, rowClassName, colSpan, cellDensityClass, renderDataRow])

  const virtualizedRows = useMemo(() => {
    if (!canVirtualize) return null
    const totalRows = rows.length
    const start = Math.min(totalRows, virtualWindow.start)
    const end = Math.min(totalRows, Math.max(start, virtualWindow.end))
    const topSpacerHeight = start * rowHeight
    const bottomSpacerHeight = Math.max(0, (totalRows - end) * rowHeight)
    const visibleRows = rows.slice(start, end).flatMap((row) => renderDataRow(row))

    const spacerRows: ReactElement[] = []
    if (topSpacerHeight > 0) {
      spacerRows.push(
        <TableRow key="__virtual_top__" className={cn(rowClassName, "hover:bg-transparent")}>
          <TableCell colSpan={colSpan} style={{ height: `${topSpacerHeight}px` }} className="p-0" />
        </TableRow>,
      )
    }
    if (bottomSpacerHeight > 0) {
      spacerRows.push(
        <TableRow key="__virtual_bottom__" className={cn(rowClassName, "hover:bg-transparent")}>
          <TableCell
            colSpan={colSpan}
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
    canVirtualize,
    rows,
    rowHeight,
    rowClassName,
    colSpan,
    renderDataRow,
    virtualWindow.end,
    virtualWindow.start,
  ])

  const summaryCells = useMemo(() => {
    if (!summary) return null
    const rowData = rows.map((row) => row.original as TData)
    const values = summary.values
    const labelColumnId = summary.labelColumnId ?? visibleLeafColumns[0]?.id ?? null
    return visibleLeafColumns.map((column) => {
      const valueGetter = values[column.id]
      if (valueGetter) return valueGetter(rowData)
      if (column.id === labelColumnId) return summary.label ?? "汇总"
      return null
    })
  }, [summary, rows, visibleLeafColumns])

  return {
    groupedRows,
    virtualizedRows,
    summaryCells,
  }
}
