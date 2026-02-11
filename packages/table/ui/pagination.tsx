import { ChevronLeft, ChevronRight } from "lucide-react"
import { type MouseEvent, useLayoutEffect, useMemo, useRef } from "react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/packages/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/packages/ui/select"
import { cn } from "@/packages/ui-utils"
import { type DataTableI18nOverrides, mergeDataTableI18n, useDataTableConfig } from "./config"
import { useDataTableInstance, useDataTableLayout } from "./context"

export interface DataTablePaginationProps {
  className?: string
  pageSizeOptions?: number[]
  showTotal?: boolean
  i18n?: DataTableI18nOverrides
}

type PaginationItemType = number | "ellipsis-left" | "ellipsis-right"

const DEFAULT_PAGE_SIZES = [10, 20, 50, 100]

function getPaginationItems(
  page: number,
  pageCount: number,
  siblingCount = 1,
  boundaryCount = 1,
): PaginationItemType[] {
  const totalPageNumbers = boundaryCount * 2 + siblingCount * 2 + 3
  if (pageCount <= totalPageNumbers) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }

  const leftSiblingIndex = Math.max(page - siblingCount, boundaryCount + 2)
  const rightSiblingIndex = Math.min(page + siblingCount, pageCount - boundaryCount - 1)

  const shouldShowLeftEllipsis = leftSiblingIndex > boundaryCount + 2
  const shouldShowRightEllipsis = rightSiblingIndex < pageCount - boundaryCount - 1

  const items: PaginationItemType[] = []

  for (let pageNumber = 1; pageNumber <= boundaryCount; pageNumber += 1) {
    items.push(pageNumber)
  }

  if (shouldShowLeftEllipsis) {
    items.push("ellipsis-left")
  } else {
    for (let pageNumber = boundaryCount + 1; pageNumber < leftSiblingIndex; pageNumber += 1) {
      items.push(pageNumber)
    }
  }

  for (let pageNumber = leftSiblingIndex; pageNumber <= rightSiblingIndex; pageNumber += 1) {
    items.push(pageNumber)
  }

  if (shouldShowRightEllipsis) {
    items.push("ellipsis-right")
  } else {
    for (
      let pageNumber = rightSiblingIndex + 1;
      pageNumber <= pageCount - boundaryCount;
      pageNumber += 1
    ) {
      items.push(pageNumber)
    }
  }

  for (let pageNumber = pageCount - boundaryCount + 1; pageNumber <= pageCount; pageNumber += 1) {
    items.push(pageNumber)
  }

  return items
}

export function DataTablePagination({
  className,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  showTotal = true,
  i18n: i18nOverrides,
}: DataTablePaginationProps) {
  const dt = useDataTableInstance()
  const layout = useDataTableLayout()
  const { i18n: globalI18n } = useDataTableConfig()
  const scrollContainer = layout?.scrollContainer ?? "window"
  const stickyPagination = layout?.stickyPagination ?? false
  const isStickyPagination =
    scrollContainer === "window" &&
    (stickyPagination === true || typeof stickyPagination === "object")
  const rootRef = useRef<HTMLDivElement>(null)

  const pageCount = Math.max(0, dt.pagination.pageCount)
  const page = Math.min(Math.max(1, dt.pagination.page), Math.max(1, pageCount))
  const size = dt.pagination.size
  const total = dt.pagination.total ?? 0

  const items = useMemo(() => getPaginationItems(page, pageCount), [page, pageCount])
  const i18n = useMemo(() => {
    return mergeDataTableI18n(globalI18n, i18nOverrides)
  }, [globalI18n, i18nOverrides])

  const handlePageClick = (nextPage: number) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (nextPage < 1 || nextPage > pageCount) return
    dt.actions.setPage(nextPage)
  }

  const handlePageSizeChange = (value: string) => {
    const nextSize = Number(value)
    if (Number.isNaN(nextSize)) return
    dt.actions.setPageSize(nextSize)
  }

  useLayoutEffect(() => {
    const paginationElement = rootRef.current
    if (!paginationElement) return

    const dataTableRoot = paginationElement.closest<HTMLElement>('[data-slot="data-table-root"]')
    if (!dataTableRoot) return

    const updateStickyHeight = () => {
      const height = isStickyPagination ? paginationElement.offsetHeight : 0
      dataTableRoot.style.setProperty("--dt-sticky-pagination-height", `${height}px`)
    }

    updateStickyHeight()

    if (typeof ResizeObserver === "undefined") {
      return () => {
        dataTableRoot.style.removeProperty("--dt-sticky-pagination-height")
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      updateStickyHeight()
    })
    resizeObserver.observe(paginationElement)
    window.addEventListener("resize", updateStickyHeight)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", updateStickyHeight)
      dataTableRoot.style.removeProperty("--dt-sticky-pagination-height")
    }
  }, [isStickyPagination])

  return (
    <div
      ref={rootRef}
      className={cn(
        "flex w-full flex-col gap-2 border-t border-border/40 bg-card px-3 py-2 sm:flex-row sm:items-center sm:justify-between",
        isStickyPagination && "sticky bottom-(--dt-sticky-bottom,0px) z-10",
        className,
      )}
    >
      <div className="text-xs text-muted-foreground/90">
        {showTotal && <span>{i18n.pagination.total(total)}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground/90">
          <Select value={`${size}`} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="h-9 w-20 border-border/50 bg-muted/20 text-muted-foreground shadow-none hover:bg-muted/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={`${option}`}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>{i18n.pagination.perPage}</span>
        </div>

        <Pagination className="mx-0 w-auto justify-start">
          <PaginationContent className="gap-1.5">
            <PaginationItem>
              <PaginationLink
                href="#"
                size="default"
                onClick={handlePageClick(page - 1)}
                aria-disabled={page <= 1}
                aria-label={i18n.pagination.previous}
                className={cn(
                  "h-9 w-9 rounded-md border border-border/50 bg-muted/20 px-0 text-muted-foreground shadow-none hover:bg-muted/30 hover:text-foreground",
                  page <= 1 && "pointer-events-none opacity-50",
                )}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">{i18n.pagination.previous}</span>
              </PaginationLink>
            </PaginationItem>

            {items.map((item) => {
              if (item === "ellipsis-left" || item === "ellipsis-right") {
                return (
                  <PaginationItem key={item}>
                    <PaginationLink
                      href="#"
                      aria-disabled
                      className="h-9 rounded-md border border-border/40 bg-muted/10 text-muted-foreground/80 shadow-none pointer-events-none"
                    >
                      ...
                    </PaginationLink>
                  </PaginationItem>
                )
              }

              const isActive = item === page
              return (
                <PaginationItem key={item}>
                  <PaginationLink
                    href="#"
                    isActive={isActive}
                    onClick={handlePageClick(item)}
                    className={cn(
                      "h-9 min-w-9 rounded-md border border-border/50 bg-muted/20 px-0 text-muted-foreground shadow-none hover:bg-muted/30 hover:text-foreground",
                      isActive &&
                        "border-primary/25 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
                    )}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            <PaginationItem>
              <PaginationLink
                href="#"
                size="default"
                onClick={handlePageClick(page + 1)}
                aria-disabled={page >= pageCount}
                aria-label={i18n.pagination.next}
                className={cn(
                  "h-9 w-9 rounded-md border border-border/50 bg-muted/20 px-0 text-muted-foreground shadow-none hover:bg-muted/30 hover:text-foreground",
                  page >= pageCount && "pointer-events-none opacity-50",
                )}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">{i18n.pagination.next}</span>
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
