import { Button } from "@/packages/ui/button"

function buildPaginationItems(currentPage: number, pageCount: number) {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }

  const pages: Array<number | "ellipsis-left" | "ellipsis-right"> = [1]
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(pageCount - 1, currentPage + 1)

  if (start > 2) {
    pages.push("ellipsis-left")
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page)
  }

  if (end < pageCount - 1) {
    pages.push("ellipsis-right")
  }

  pages.push(pageCount)
  return pages
}

interface TenantProjectsPaginationProps {
  currentPage: number
  pageCount: number
  onPageChange: (page: number) => void
}

export function TenantProjectsPagination({
  currentPage,
  pageCount,
  onPageChange,
}: TenantProjectsPaginationProps) {
  if (pageCount <= 1) {
    return null
  }

  const pageItems = buildPaginationItems(currentPage, pageCount)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/50 bg-card/50 px-4 py-3">
      <p className="text-sm text-muted-foreground">
        第 {currentPage} / {pageCount} 页
      </p>
      <div className="flex flex-wrap items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="cursor-pointer"
        >
          上一页
        </Button>
        {pageItems.map((item) => {
          if (typeof item !== "number") {
            return (
              <span key={item} className="px-2 text-muted-foreground">
                ...
              </span>
            )
          }

          return (
            <Button
              key={item}
              type="button"
              variant={item === currentPage ? "default" : "ghost"}
              size="sm"
              onClick={() => onPageChange(item)}
              className="min-w-9 cursor-pointer"
            >
              {item}
            </Button>
          )
        })}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= pageCount}
          className="cursor-pointer"
        >
          下一页
        </Button>
      </div>
    </div>
  )
}
