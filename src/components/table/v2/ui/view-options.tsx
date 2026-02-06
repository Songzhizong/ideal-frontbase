import { MoreHorizontal, RotateCcw } from "lucide-react"
import { type ReactNode, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { type DataTableI18nOverrides, mergeDataTableI18n, useDataTableConfig } from "./config"
import { useDataTableInstance } from "./context"

type DensityValue = "compact" | "comfortable"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getDensity(meta: unknown): DensityValue | null {
  if (!isRecord(meta)) return null
  return meta.dtDensity === "compact" || meta.dtDensity === "comfortable" ? meta.dtDensity : null
}

function getSetDensity(meta: unknown): ((value: DensityValue) => void) | null {
  if (!isRecord(meta)) return null
  const value = meta.dtSetDensity
  return typeof value === "function" ? (value as (value: DensityValue) => void) : null
}

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

export interface DataTableViewOptionsProps {
  className?: string
  trigger?: ReactNode
  i18n?: DataTableI18nOverrides
  showResetAll?: boolean
}

export function DataTableViewOptions({
  className,
  trigger,
  i18n: i18nOverrides,
  showResetAll = true,
}: DataTableViewOptionsProps) {
  const dt = useDataTableInstance()
  const { i18n: globalI18n } = useDataTableConfig()
  const i18n = useMemo(() => {
    return mergeDataTableI18n(globalI18n, i18nOverrides)
  }, [globalI18n, i18nOverrides])

  const columns = dt.table.getAllLeafColumns().filter((column) => column.getCanHide())
  const hasColumns = columns.length > 0
  const allVisible = hasColumns ? columns.every((column) => column.getIsVisible()) : true
  const someVisible = hasColumns ? columns.some((column) => column.getIsVisible()) : false

  const density = getDensity(dt.table.options.meta)
  const setDensity = getSetDensity(dt.table.options.meta)
  const hasDensity = Boolean(density && setDensity)

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

  const handleDensityChange = (nextDensity: string) => {
    if (!setDensity) return
    if (nextDensity !== "compact" && nextDensity !== "comfortable") return
    setDensity(nextDensity)
  }

  const defaultTrigger = (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className={cn("h-8 w-8", className)}
      aria-label={i18n.viewOptions.triggerAriaLabel}
    >
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger ?? defaultTrigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        {hasDensity ? (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {i18n.viewOptions.densityLabel}
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={density ?? "comfortable"}
              onValueChange={handleDensityChange}
            >
              <DropdownMenuRadioItem value="compact">
                {i18n.density.compactText}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="comfortable">
                {i18n.density.comfortableText}
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </>
        ) : null}

        {hasColumns ? (
          <>
            {hasDensity ? <DropdownMenuSeparator /> : null}
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
            <DropdownMenuCheckboxItem
              checked={allVisible || (someVisible && "indeterminate")}
              onCheckedChange={(value) => handleToggleAll(Boolean(value))}
            >
              {i18n.columnToggle.selectAllText}
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <div className="max-h-72 overflow-y-auto">
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(Boolean(value))}
                >
                  {getColumnLabel(column)}
                </DropdownMenuCheckboxItem>
              ))}
            </div>
          </>
        ) : null}

        {showResetAll ? (
          <>
            {hasColumns || hasDensity ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem onSelect={() => dt.actions.resetAll()}>
              <RotateCcw className="h-4 w-4" />
              {i18n.viewOptions.resetAllText}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
