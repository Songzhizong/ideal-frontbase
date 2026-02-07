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
import type { CSSProperties, ReactElement, ReactNode } from "react"
import { useState } from "react"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { DataTableInstance } from "../../core"
import { DataTableDragSortRowProvider } from "../drag-handle"
import { DataTableDropIndicator } from "../drop-indicator"
import {
  type DragSortDropPosition,
  getParentRowId,
  isDescendantRow,
  type TableDragSortMeta,
} from "./helpers"

export interface DataTableDragSortBodyProps<TData> {
  dt: DataTableInstance<TData, unknown>
  rows: Array<Row<TData>>
  rowsById: Record<string, Row<TData>>
  rowClassName: string
  cellDensityClass: string
  colSpan: number
  treeIndentSize: number
  allowNestingEnabled: boolean
  dragSortMeta: TableDragSortMeta
  renderCells: (row: Row<TData>) => ReactNode
  renderExpandedRow: (row: Row<TData>) => ReactElement | null
}

function renderDropIndicatorRow(
  rowClassName: string,
  colSpan: number,
  key: string,
  position: DragSortDropPosition,
  indentPx?: number,
) {
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

export function DataTableDragSortBody<TData>({
  dt,
  rows,
  rowsById,
  rowClassName,
  cellDensityClass,
  colSpan,
  treeIndentSize,
  allowNestingEnabled,
  dragSortMeta,
  renderCells,
  renderExpandedRow,
}: DataTableDragSortBodyProps<TData>) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))
  const accessibility =
    typeof document === "undefined"
      ? undefined
      : {
          container: document.body,
        }
  const [dragOver, setDragOver] = useState<{
    overId: string | null
    position: DragSortDropPosition
  } | null>(null)
  const sortableRowIds = rows.map((row) => row.id)

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
            "hover:bg-table-row-hover data-[state=selected]:bg-muted/70 border-b transition-colors",
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

  return (
    <DndContext
      sensors={sensors}
      {...(accessibility ? { accessibility } : {})}
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

        const activeRow = rowsById[activeId]
        const overRow = rowsById[overId]
        if (!activeRow || !overRow) {
          setDragOver(null)
          return
        }

        if (dt.tree.enabled && isDescendantRow(overRow, activeId)) {
          setDragOver(null)
          return
        }

        if (dt.tree.enabled && !allowNestingEnabled) {
          const activeParentId = getParentRowId(activeRow)
          const overParentId = getParentRowId(overRow)
          if (activeParentId !== overParentId) {
            setDragOver(null)
            return
          }
        }

        if (dragSortMeta.canDrop && !dragSortMeta.canDrop(activeRow.original, overRow.original)) {
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

        const activeRow = rowsById[activeId]
        const overRow = rowsById[overId]
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

        if (dt.tree.enabled && isDescendantRow(overRow, activeId)) {
          dragSortMeta.onDragCancel?.()
          return
        }

        if (dt.tree.enabled && !allowNestingEnabled) {
          const activeParentId = getParentRowId(activeRow)
          const overParentId = getParentRowId(overRow)
          if (activeParentId !== overParentId) {
            dragSortMeta.onDragCancel?.()
            return
          }
        }

        if (dragSortMeta.canDrop && !dragSortMeta.canDrop(activeRow.original, overRow.original)) {
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
        {rows.flatMap((row) => {
          const rowItems: ReactElement[] = []

          if (dragOver?.overId === row.id && dragOver.position === "above") {
            rowItems.push(
              renderDropIndicatorRow(rowClassName, colSpan, `${row.id}__drop_above`, "above"),
            )
          }

          rowItems.push(<SortableRow key={row.id} row={row} />)

          const expandedRow = renderExpandedRow(row)
          if (expandedRow) rowItems.push(expandedRow)

          if (dragOver?.overId === row.id && dragOver.position !== "above") {
            rowItems.push(
              renderDropIndicatorRow(
                rowClassName,
                colSpan,
                `${row.id}__drop_${dragOver.position}`,
                dragOver.position,
                dragOver.position === "inside" ? (row.depth + 1) * treeIndentSize : undefined,
              ),
            )
          }

          return rowItems
        })}
      </SortableContext>

      {dragSortMeta.overlay !== "minimal" && (
        <DragOverlay>
          {dt.dragSort.activeId && rowsById[dt.dragSort.activeId] ? (
            <div
              className={cn(
                "rounded-md border border-border/50 bg-background shadow-sm",
                dragSortMeta.overlay === "ghost" && "opacity-70",
              )}
            >
              <Table className="table-fixed">
                <TableBody>
                  <TableRow className={cn(rowClassName, "border-0")}>
                    {rowsById[dt.dragSort.activeId]?.getVisibleCells().map((cell) => (
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
}
