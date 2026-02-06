import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTableConfig, useTableContext } from "@/components/table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface DataTablePaginationProps {
  className?: string
  /**
   * i18n text overrides
   */
  text?: {
    total?: (count: number) => string
    perPage?: string
    firstPage?: string
    previousPage?: string
    nextPage?: string
    lastPage?: string
  }
}

type PaginationItem = number | "ellipsis-left" | "ellipsis-right"

function getPaginationItems(
  pageNumber: number,
  totalPages: number,
  siblingCount: number,
  boundaryCount: number,
): PaginationItem[] {
  const totalPageNumbers = boundaryCount * 2 + siblingCount * 2 + 3

  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const leftSiblingIndex = Math.max(pageNumber - siblingCount, boundaryCount + 2)
  const rightSiblingIndex = Math.min(pageNumber + siblingCount, totalPages - boundaryCount - 1)

  const shouldShowLeftEllipsis = leftSiblingIndex > boundaryCount + 2
  const shouldShowRightEllipsis = rightSiblingIndex < totalPages - boundaryCount - 1

  const items: PaginationItem[] = []

  for (let page = 1; page <= boundaryCount; page += 1) {
    items.push(page)
  }

  if (shouldShowLeftEllipsis) {
    items.push("ellipsis-left")
  } else {
    for (let page = boundaryCount + 1; page < leftSiblingIndex; page += 1) {
      items.push(page)
    }
  }

  for (let page = leftSiblingIndex; page <= rightSiblingIndex; page += 1) {
    items.push(page)
  }

  if (shouldShowRightEllipsis) {
    items.push("ellipsis-right")
  } else {
    for (let page = rightSiblingIndex + 1; page <= totalPages - boundaryCount; page += 1) {
      items.push(page)
    }
  }

  for (let page = totalPages - boundaryCount + 1; page <= totalPages; page += 1) {
    items.push(page)
  }

  return items
}

/**
 * Pagination component that consumes state from TableContext
 * Reduces prop drilling by reading pagination state from context
 * Enhanced with i18n support
 */
export function DataTablePagination({ className, text }: DataTablePaginationProps) {
  const {
    pagination,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50, 100],
    showTotal = true,
  } = useTableContext()
  const { i18n: defaultI18n } = useTableConfig()

  if (!pagination || !onPageChange || !onPageSizeChange) {
    throw new Error("DataTablePagination requires pagination context")
  }

  const { pageNumber, pageSize, totalElements, totalPages } = pagination

  const canPreviousPage = pageNumber > 1
  const canNextPage = pageNumber < totalPages

  // Merge default i18n with custom text (custom text takes priority)
  const i18n = { ...defaultI18n, ...text }
  const paginationItems = getPaginationItems(pageNumber, totalPages, 1, 1)

  return (
    <div className={`flex items-center justify-between gap-4 px-2 ${className || ""}`}>
      <div className="flex-1 text-sm text-muted-foreground">
        {showTotal && <span>{i18n.total(totalElements)}</span>}
      </div>
      <div className="flex items-center gap-4 lg:gap-6">
        <div className="flex items-center gap-2">
          <Select value={`${pageSize}`} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger className="h-8 w-28">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size} {i18n.perPage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(pageNumber - 1)}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">{i18n.previousPage}</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {paginationItems.map((item) => {
            if (item === "ellipsis-left" || item === "ellipsis-right") {
              return (
                <Button key={item} variant="outline" className="h-8 w-8 p-0" disabled>
                  <span className="text-sm text-muted-foreground">...</span>
                </Button>
              )
            }

            const isActive = item === pageNumber
            return (
              <Button
                key={item}
                variant={isActive ? "default" : "outline"}
                className="h-8 w-8 p-0"
                onClick={() => onPageChange(item)}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="text-sm font-medium">{item}</span>
              </Button>
            )
          })}
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(pageNumber + 1)}
            disabled={!canNextPage}
          >
            <span className="sr-only">{i18n.nextPage}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
