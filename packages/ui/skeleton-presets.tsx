import type * as React from "react"
import { cn } from "@/packages/ui-utils"
import { Skeleton } from "./skeleton"

export interface TableSkeletonProps extends React.ComponentProps<"div"> {
  rows?: number | undefined
  columns?: number | undefined
  showHeader?: boolean | undefined
}

export interface CardSkeletonProps extends React.ComponentProps<"div"> {
  cards?: number | undefined
}

export interface FormSkeletonProps extends React.ComponentProps<"div"> {
  rows?: number | undefined
  actions?: boolean | undefined
}

export interface DetailSkeletonProps extends React.ComponentProps<"div"> {
  rows?: number | undefined
}

function createKeys(prefix: string, count: number) {
  return Array.from({ length: count }, (_, order) => `${prefix}-${order + 1}`)
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
  ...props
}: TableSkeletonProps) {
  const rowCount = Math.max(rows, 1)
  const columnCount = Math.max(columns, 1)
  const headerKeys = createKeys("header", columnCount)
  const rowKeys = createKeys("row", rowCount)
  const columnKeys = createKeys("column", columnCount)

  return (
    <div data-slot="table-skeleton" className={cn("space-y-2", className)} {...props}>
      <div className="overflow-x-auto rounded-lg border border-border/50">
        <div className="min-w-[520px]">
          {showHeader ? (
            <div className="grid gap-3 border-b border-border/50 bg-muted/40 px-4 py-3">
              <div
                className="grid gap-3"
                style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
              >
                {headerKeys.map((columnKey) => (
                  <Skeleton key={columnKey} className="h-4 w-3/4" />
                ))}
              </div>
            </div>
          ) : null}
          <div className="divide-y divide-border/50">
            {rowKeys.map((rowKey) => (
              <div key={rowKey} className="px-4 py-3">
                <div
                  className="grid gap-3"
                  style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
                >
                  {columnKeys.map((columnKey, columnIndex) => (
                    <Skeleton
                      key={`${rowKey}-${columnKey}`}
                      className={cn("h-4", columnIndex === 0 ? "w-5/6" : "w-full")}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function CardSkeleton({ cards = 3, className, ...props }: CardSkeletonProps) {
  const cardCount = Math.max(cards, 1)
  const cardKeys = createKeys("card", cardCount)

  return (
    <div
      data-slot="card-skeleton"
      className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-3", className)}
      {...props}
    >
      {cardKeys.map((cardKey) => (
        <div key={cardKey} className="space-y-3 rounded-lg border border-border/50 bg-card p-4">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-8 w-1/2" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function FormSkeleton({ rows = 4, actions = true, className, ...props }: FormSkeletonProps) {
  const rowCount = Math.max(rows, 1)
  const fieldKeys = createKeys("field", rowCount)

  return (
    <div
      data-slot="form-skeleton"
      className={cn("space-y-4 rounded-lg border border-border/50 bg-card p-4", className)}
      {...props}
    >
      {fieldKeys.map((fieldKey) => (
        <div key={fieldKey} className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
      {actions ? (
        <div className="flex justify-end gap-2 border-t border-border/50 pt-4">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      ) : null}
    </div>
  )
}

export function DetailSkeleton({ rows = 6, className, ...props }: DetailSkeletonProps) {
  const rowCount = Math.max(rows, 1)
  const detailKeys = createKeys("detail", rowCount)

  return (
    <div
      data-slot="detail-skeleton"
      className={cn("space-y-3 rounded-lg border border-border/50 bg-card p-4", className)}
      {...props}
    >
      <Skeleton className="h-6 w-1/3" />
      {detailKeys.map((detailKey) => (
        <div key={detailKey} className="grid grid-cols-1 gap-2 md:grid-cols-[10rem_minmax(0,1fr)]">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  )
}
