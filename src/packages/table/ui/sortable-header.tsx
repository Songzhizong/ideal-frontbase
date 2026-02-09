import type { Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { Button } from "@/packages/ui/button"
import { cn } from "@/packages/ui-utils"

export interface DataTableSortableHeaderProps<TData> {
  column: Column<TData>
  label: string
  className?: string
}

export function DataTableSortableHeader<TData>({
  column,
  label,
  className,
}: DataTableSortableHeaderProps<TData>) {
  const canSort = column.getCanSort()
  const sorted = column.getIsSorted()
  const icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown
  const Icon = canSort ? icon : ArrowUpDown

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("h-8 gap-1 px-2", className)}
      onClick={column.getToggleSortingHandler()}
      disabled={!canSort}
    >
      <span>{label}</span>
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
    </Button>
  )
}
