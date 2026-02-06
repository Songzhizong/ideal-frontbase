import { Settings2 } from "lucide-react"
import { type ReactNode, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { type DataTableI18nOverrides, mergeDataTableI18n, useDataTableConfig } from "./config"
import { useDataTableInstance } from "./context"

function getColumnLabel(column: {
  id: string
  columnDef: { header?: unknown; meta?: unknown }
}): string {
  const meta = column.columnDef.meta
  if (meta && typeof meta === "object" && "headerLabel" in meta) {
    const value = (meta as { headerLabel?: unknown }).headerLabel
    if (typeof value === "string" && value.trim() !== "") return value
  }
  const header = column.columnDef.header
  if (typeof header === "string" && header.trim() !== "") return header
  return column.id
}

export interface DataTableColumnToggleProps {
  className?: string
  trigger?: ReactNode
  i18n?: DataTableI18nOverrides
}

export function DataTableColumnToggle({
  className,
  trigger,
  i18n: i18nOverrides,
}: DataTableColumnToggleProps) {
  const dt = useDataTableInstance()
  const { i18n: globalI18n } = useDataTableConfig()
  const i18n = useMemo(() => {
    return mergeDataTableI18n(globalI18n, i18nOverrides)
  }, [globalI18n, i18nOverrides])

  const columns = dt.table.getAllLeafColumns().filter((column) => column.getCanHide())
  const hasColumns = columns.length > 0
  const allVisible = hasColumns ? columns.every((column) => column.getIsVisible()) : true
  const someVisible = hasColumns ? columns.some((column) => column.getIsVisible()) : false

  const handleToggleAll = (checked: boolean) => {
    if (!hasColumns) return
    if (checked) {
      for (const column of columns) {
        column.toggleVisibility(true)
      }
      return
    }

    const [first, ...rest] = columns
    first?.toggleVisibility(true)
    for (const column of rest) {
      column.toggleVisibility(false)
    }
  }

  const defaultTrigger = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("h-8", className)}
      aria-label={i18n.columnToggleLabel}
    >
      <Settings2 className="h-4 w-4" />
    </Button>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger ?? defaultTrigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">{i18n.columnToggleLabel}</DropdownMenuLabel>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => dt.actions.resetColumnVisibility()}
          >
            {i18n.columnToggle.resetText}
          </Button>
        </div>
        <DropdownMenuSeparator />

        <div className="flex items-center gap-2 px-2 py-2">
          <Checkbox
            checked={allVisible || (someVisible && "indeterminate")}
            onCheckedChange={(value) => handleToggleAll(Boolean(value))}
          />
          <span className="text-sm text-muted-foreground">{i18n.columnToggle.selectAllText}</span>
        </div>

        <DropdownMenuSeparator />

        <div className="max-h-80 overflow-y-auto">
          {columns.map((column) => (
            <div
              key={column.id}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-2 hover:bg-accent"
            >
              <label
                htmlFor={`dt-column-${column.id}`}
                className="flex flex-1 items-center gap-2 cursor-pointer"
              >
                <Checkbox
                  id={`dt-column-${column.id}`}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(Boolean(value))}
                />
                <span className="flex-1 text-sm select-none">{getColumnLabel(column)}</span>
              </label>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
