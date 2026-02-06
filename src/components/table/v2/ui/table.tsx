import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { flexRender, type Row } from "@tanstack/react-table"
import { AlertCircle } from "lucide-react"
import type { CSSProperties, ReactElement, ReactNode } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { type DataTableI18nOverrides, mergeDataTableI18n, useDataTableConfig } from "./config"
import { useDataTableInstance, useDataTableLayout } from "./context"
import { DataTableDragSortRowProvider } from "./drag-handle"
import { DataTableDropIndicator } from "./drop-indicator"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getMetaClass(meta: unknown, key: "headerClassName" | "cellClassName"): string | undefined {
  if (!isRecord(meta)) return undefined
  const value = meta[key]
  return typeof value === "string" && value.trim() !== "" ? value : undefined
}

function getDensity(meta: unknown): "compact" | "comfortable" {
  if (!isRecord(meta)) return "compact"
  return meta.dtDensity === "comfortable" ? "comfortable" : "compact"
}

function getTreeIndentSize(meta: unknown): number {
  if (!isRecord(meta)) return 24
  const value = meta.dtTreeIndentSize
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 24
}

function getTreeAllowNesting(meta: unknown): boolean {
  if (!isRecord(meta)) return false
  return meta.dtTreeAllowNesting === true
}

function getParentRowId<TData>(row: Row<TData>): string | null {
  const parent = row.getParentRow()
  return parent ? parent.id : null
}

function isDescendantRow<TData>(row: Row<TData>, ancestorId: string): boolean {
  let current = row.getParentRow()
  while (current) {
    if (current.id === ancestorId) return true
    current = current.getParentRow()
  }
  return false
}

type DragSortOverlayMode = "row" | "ghost" | "minimal"
type DragSortDropPosition = "above" | "below" | "inside"

function getDragSortMeta(meta: unknown): {
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
} {
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
  }
}

export interface DataTableTableProps<TData> {
  className?: string
  renderEmpty?: () => ReactNode
  renderError?: (error: unknown, retry?: () => void | Promise<void>) => ReactNode
  renderSubComponent?: (row: Row<TData>) => ReactNode
  i18n?: DataTableI18nOverrides
}

const SKELETON_ROW_KEYS = ["dt-skeleton-1", "dt-skeleton-2", "dt-skeleton-3"]

export function DataTableTable<TData>({
  className,
  renderEmpty,
  renderError,
  renderSubComponent,
  i18n: i18nOverrides,
}: DataTableTableProps<TData>) {
  const dt = useDataTableInstance<TData, unknown>()
  const layout = useDataTableLayout()
  const { i18n: globalI18n } = useDataTableConfig()
  const scrollContainer = layout?.scrollContainer ?? "window"
  const stickyHeader = layout?.stickyHeader ?? false
  const isStickyHeader = stickyHeader === true || typeof stickyHeader === "object"
  const i18n = useMemo(() => {
    return mergeDataTableI18n(globalI18n, i18nOverrides)
  }, [globalI18n, i18nOverrides])

  const tableMeta = dt.table.options.meta
  const density = getDensity(tableMeta)
  const cellDensityClass = density === "comfortable" ? "py-4" : "py-2"
  const treeIndentSize = getTreeIndentSize(tableMeta)
  const treeAllowNesting = getTreeAllowNesting(tableMeta)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scrollEdges, setScrollEdges] = useState({ left: false, right: false })

  useEffect(() => {
    const root = wrapperRef.current
    if (!root) return
    const scrollElement = root.querySelector<HTMLDivElement>('[data-slot="table-container"]')
    if (!scrollElement) return

    const update = () => {
      const left = scrollElement.scrollLeft > 0
      const right =
        scrollElement.scrollLeft + scrollElement.clientWidth <
        Math.max(0, scrollElement.scrollWidth - 1)
      setScrollEdges((prev) =>
        prev.left === left && prev.right === right ? prev : { left, right },
      )
    }

    update()
    scrollElement.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      scrollElement.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  const leftPinned = dt.table.getLeftLeafColumns()
  const rightPinned = dt.table.getRightLeafColumns()
  const lastLeftPinnedId = leftPinned[leftPinned.length - 1]?.id
  const firstRightPinnedId = rightPinned[0]?.id

  const columnCount = dt.table.getVisibleLeafColumns().length
  const colSpan = Math.max(1, columnCount)
  const isInitialLoading = dt.activity.isInitialLoading || !dt.activity.preferencesReady
  const isFetching = dt.activity.isFetching

  const headerClassName = cn(
    isStickyHeader && "sticky top-[var(--dt-sticky-top,0px)] z-10 bg-background",
    "[&_tr]:border-border/50",
  )

  const rowClassName = "border-border/50"

  const dragSortEnabled = dt.dragSort.enabled
  const dragSortMeta = useMemo(
    () => getDragSortMeta(dt.table.options.meta),
    [dt.table.options.meta],
  )
  const allowNestingEnabled = dragSortMeta.allowNesting && dt.tree.enabled && treeAllowNesting
  const rowModel = dt.table.getRowModel()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))
  const [dragOver, setDragOver] = useState<{
    overId: string | null
    position: DragSortDropPosition
  } | null>(null)
  const sortableRowIds = rowModel.rows.map((row) => row.id)

  const renderCells = (row: Row<TData>) => {
    return row.getVisibleCells().map((cell) => {
      const pinned = cell.column.getIsPinned()
      const isPinned = pinned === "left" || pinned === "right"
      const isBoundaryLeft = scrollEdges.left && cell.column.id === lastLeftPinnedId
      const isBoundaryRight = scrollEdges.right && cell.column.id === firstRightPinnedId
      const cellMetaClass = getMetaClass(cell.column.columnDef.meta, "cellClassName")
      return (
        <TableCell
          key={cell.id}
          style={{
            width: `${cell.column.getSize()}px`,
            minWidth: `${cell.column.getSize()}px`,
            ...(isPinned
              ? pinned === "left"
                ? { position: "sticky", left: `${cell.column.getStart("left")}px` }
                : { position: "sticky", right: `${cell.column.getAfter("right")}px` }
              : {}),
            zIndex: isPinned ? 10 : undefined,
          }}
          className={cn(
            cellDensityClass,
            isPinned && "bg-background",
            isBoundaryLeft &&
              "relative after:absolute after:inset-y-0 after:right-0 after:w-2 after:translate-x-full after:bg-linear-to-r after:from-border/50 after:to-transparent after:pointer-events-none",
            isBoundaryRight &&
              "relative before:absolute before:inset-y-0 before:left-0 before:w-2 before:-translate-x-full before:bg-linear-to-l before:from-border/50 before:to-transparent before:pointer-events-none",
            cellMetaClass,
          )}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      )
    })
  }

  const renderExpandedRow = (row: Row<TData>) => {
    if (!renderSubComponent || !row.getIsExpanded()) return null
    return (
      <TableRow key={`${row.id}__expanded`} className={rowClassName}>
        <TableCell colSpan={colSpan} className={cn("bg-muted/30", cellDensityClass)}>
          {renderSubComponent(row)}
        </TableCell>
      </TableRow>
    )
  }

  const renderDropIndicatorRow = (
    key: string,
    position: DragSortDropPosition,
    indentPx?: number,
  ) => {
    return (
      <TableRow key={key} className={cn(rowClassName, "border-0 hover:bg-transparent")}>
        <TableCell colSpan={colSpan} className="p-0">
          <div className="relative h-0">
            <DataTableDropIndicator
              position={position}
              {...(typeof indentPx === "number" ? { indentPx } : {})}
            />
          </div>
        </TableCell>
      </TableRow>
    )
  }

  function SortableRow({ row }: { row: Row<TData> }) {
    const canDrag = dragSortMeta.canDrag ? dragSortMeta.canDrag(row.original) : true
    const sortable = useSortable({
      id: row.id,
      disabled: !canDrag,
    })
    const dragProps = dragSortMeta.handle
      ? {}
      : {
          ...sortable.attributes,
          ...(sortable.listeners ?? {}),
        }
    const transform = sortable.transform
    const style: CSSProperties = {
      transform: transform
        ? `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0)`
        : undefined,
      transition: sortable.transition ?? undefined,
    }
    return (
      <DataTableDragSortRowProvider
        value={{
          handle: dragSortMeta.handle,
          isDragging: sortable.isDragging,
          setActivatorNodeRef: sortable.setActivatorNodeRef,
          attributes: sortable.attributes as unknown as Record<string, unknown>,
          listeners: (sortable.listeners ?? {}) as unknown as Record<string, unknown>,
        }}
      >
        <tr
          ref={sortable.setNodeRef}
          style={style}
          data-state={row.getIsSelected() && "selected"}
          className={cn(
            "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
            rowClassName,
            !dragSortMeta.handle && "cursor-grab",
            sortable.isDragging && "opacity-50",
          )}
          {...dragProps}
        >
          {renderCells(row)}
        </tr>
      </DataTableDragSortRowProvider>
    )
  }

  const regularRows = rowModel.rows.flatMap((row) => {
    const baseRow = (
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() && "selected"}
        className={rowClassName}
      >
        {renderCells(row as Row<TData>)}
      </TableRow>
    )
    const expandedRow = renderExpandedRow(row as Row<TData>)
    return expandedRow ? [baseRow, expandedRow] : [baseRow]
  })

  const dragSortRows = (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event: DragStartEvent) => {
        const activeId = String(event.active.id)
        dragSortMeta.onDragStart?.(activeId)
        setDragOver(null)
      }}
      onDragOver={(event: DragOverEvent) => {
        if (!event.over) {
          setDragOver(null)
          return
        }
        const activeId = String(event.active.id)
        const overId = String(event.over.id)
        if (activeId === overId) {
          setDragOver(null)
          return
        }

        const activeIndex = sortableRowIds.indexOf(activeId)
        const overIndex = sortableRowIds.indexOf(overId)
        if (activeIndex < 0 || overIndex < 0) return

        const activeRow = rowModel.rowsById[activeId]
        const overRow = rowModel.rowsById[overId]
        if (!activeRow || !overRow) {
          setDragOver(null)
          return
        }

        if (dt.tree.enabled && isDescendantRow(overRow as Row<TData>, activeId)) {
          setDragOver(null)
          return
        }

        if (dt.tree.enabled && !allowNestingEnabled) {
          const activeParentId = getParentRowId(activeRow as Row<TData>)
          const overParentId = getParentRowId(overRow as Row<TData>)
          if (activeParentId !== overParentId) {
            setDragOver(null)
            return
          }
        }

        if (
          dragSortMeta.canDrop &&
          !dragSortMeta.canDrop(
            (activeRow as Row<TData>).original,
            (overRow as Row<TData>).original,
          )
        ) {
          setDragOver(null)
          return
        }

        const translated = event.active.rect.current.translated
        const rect = event.over.rect
        if (translated && rect.height > 0) {
          const centerY = translated.top + translated.height / 2
          const ratio = (centerY - rect.top) / rect.height
          if (allowNestingEnabled) {
            if (ratio < 0.25) {
              setDragOver({ overId, position: "above" })
              return
            }
            if (ratio > 0.75) {
              setDragOver({ overId, position: "below" })
              return
            }
            setDragOver({ overId, position: "inside" })
            return
          }
          setDragOver({ overId, position: ratio < 0.5 ? "above" : "below" })
          return
        }

        setDragOver({ overId, position: activeIndex < overIndex ? "below" : "above" })
      }}
      onDragEnd={(event: DragEndEvent) => {
        if (!event.over) {
          dragSortMeta.onDragCancel?.()
          setDragOver(null)
          return
        }
        const activeId = String(event.active.id)
        const overId = String(event.over.id)
        let position: DragSortDropPosition =
          overId && dragOver?.overId === overId ? dragOver.position : "above"
        setDragOver(null)

        const activeRow = rowModel.rowsById[activeId]
        const overRow = rowModel.rowsById[overId]
        if (!activeRow || !overRow) {
          dragSortMeta.onDragCancel?.()
          return
        }

        const translated = event.active.rect.current.translated
        const rect = event.over.rect
        if (!overId || !translated || rect.height <= 0) {
          position = "above"
        } else {
          const centerY = translated.top + translated.height / 2
          const ratio = (centerY - rect.top) / rect.height
          if (allowNestingEnabled) {
            position = ratio < 0.25 ? "above" : ratio > 0.75 ? "below" : "inside"
          } else {
            position = ratio < 0.5 ? "above" : "below"
          }
        }

        if (dt.tree.enabled && isDescendantRow(overRow as Row<TData>, activeId)) {
          dragSortMeta.onDragCancel?.()
          return
        }

        if (dt.tree.enabled && !allowNestingEnabled) {
          const activeParentId = getParentRowId(activeRow as Row<TData>)
          const overParentId = getParentRowId(overRow as Row<TData>)
          if (activeParentId !== overParentId) {
            dragSortMeta.onDragCancel?.()
            return
          }
        }

        if (
          dragSortMeta.canDrop &&
          !dragSortMeta.canDrop(
            (activeRow as Row<TData>).original,
            (overRow as Row<TData>).original,
          )
        ) {
          dragSortMeta.onDragCancel?.()
          return
        }

        void dragSortMeta.onDragEnd?.({ activeId, overId, position })
      }}
      onDragCancel={() => {
        dragSortMeta.onDragCancel?.()
        setDragOver(null)
      }}
    >
      <SortableContext items={sortableRowIds} strategy={verticalListSortingStrategy}>
        {rowModel.rows.flatMap((row) => {
          const rows: ReactElement[] = []

          if (dragOver?.overId === row.id && dragOver.position === "above") {
            rows.push(renderDropIndicatorRow(`${row.id}__drop_above`, "above"))
          }

          rows.push(<SortableRow key={row.id} row={row as Row<TData>} />)

          const expandedRow = renderExpandedRow(row as Row<TData>)
          if (expandedRow) rows.push(expandedRow)

          if (dragOver?.overId === row.id && dragOver.position !== "above") {
            rows.push(
              renderDropIndicatorRow(
                `${row.id}__drop_${dragOver.position}`,
                dragOver.position,
                dragOver.position === "inside" ? (row.depth + 1) * treeIndentSize : undefined,
              ),
            )
          }

          return rows
        })}
      </SortableContext>

      {dragSortMeta.overlay !== "minimal" && (
        <DragOverlay>
          {dt.dragSort.activeId && rowModel.rowsById[dt.dragSort.activeId] ? (
            <div
              className={cn(
                "rounded-md border border-border/50 bg-background shadow-sm",
                dragSortMeta.overlay === "ghost" && "opacity-70",
              )}
            >
              <Table className="table-fixed">
                <TableBody>
                  <TableRow className={cn(rowClassName, "border-0")}>
                    {(rowModel.rowsById[dt.dragSort.activeId] as Row<TData>)
                      .getVisibleCells()
                      .map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{
                            width: `${cell.column.getSize()}px`,
                            minWidth: `${cell.column.getSize()}px`,
                          }}
                          className={cellDensityClass}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : null}
        </DragOverlay>
      )}
    </DndContext>
  )

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-col",
        scrollContainer === "root" && "flex-1",
        className,
      )}
    >
      {isFetching && !isInitialLoading && (
        <div className="absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground shadow-sm">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>{i18n.refreshingText}</span>
        </div>
      )}
      <div
        ref={wrapperRef}
        className={cn("min-h-0 w-full", scrollContainer === "root" ? "flex-1 overflow-y-auto" : "")}
      >
        <Table className="table-fixed">
          <TableHeader className={headerClassName}>
            {dt.table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className={rowClassName}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{
                      width: `${header.getSize()}px`,
                      minWidth: `${header.getSize()}px`,
                      ...(header.column.getIsPinned()
                        ? header.column.getIsPinned() === "left"
                          ? {
                              position: "sticky",
                              left: `${header.column.getStart("left")}px`,
                            }
                          : {
                              position: "sticky",
                              right: `${header.column.getAfter("right")}px`,
                            }
                        : {}),
                      zIndex: header.column.getIsPinned() ? 20 : undefined,
                    }}
                    className={cn(
                      "relative",
                      header.column.getIsPinned() && "bg-background",
                      scrollEdges.left &&
                        header.column.id === lastLeftPinnedId &&
                        "after:absolute after:inset-y-0 after:right-0 after:w-2 after:translate-x-full after:bg-linear-to-r after:from-border/50 after:to-transparent after:pointer-events-none",
                      scrollEdges.right &&
                        header.column.id === firstRightPinnedId &&
                        "before:absolute before:inset-y-0 before:left-0 before:w-2 before:-translate-x-full before:bg-linear-to-l before:from-border/50 before:to-transparent before:pointer-events-none",
                      getMetaClass(header.column.columnDef.meta, "headerClassName"),
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                      {header.column.getCanResize() && (
                        <button
                          type="button"
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          aria-label={i18n.columnResizeHandleLabel}
                          className={cn(
                            "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none border-0 bg-transparent p-0",
                            header.column.getIsResizing() && "bg-primary",
                          )}
                        />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {dt.status.type === "error"
              ? (() => {
                  const customError = renderError?.(dt.status.error, dt.actions.retry)
                  return (
                    <TableRow className={rowClassName}>
                      <TableCell colSpan={colSpan} className="h-24 text-center">
                        {customError ?? (
                          <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <AlertCircle className="h-4 w-4" />
                            <span>{i18n.errorText}</span>
                            <Button variant="outline" size="sm" onClick={() => dt.actions.retry()}>
                              {i18n.retryText}
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })()
              : !isInitialLoading && dt.status.type === "empty"
                ? (() => {
                    const customEmpty = renderEmpty?.()
                    return (
                      <TableRow className={rowClassName}>
                        <TableCell
                          colSpan={colSpan}
                          className="h-24 text-center text-muted-foreground"
                        >
                          {customEmpty ?? i18n.emptyText}
                        </TableCell>
                      </TableRow>
                    )
                  })()
                : isInitialLoading
                  ? SKELETON_ROW_KEYS.map((key) => (
                      <TableRow key={key} className={rowClassName}>
                        <TableCell colSpan={colSpan} className={cn("py-4", cellDensityClass)}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  : dragSortEnabled
                    ? dragSortRows
                    : regularRows}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
