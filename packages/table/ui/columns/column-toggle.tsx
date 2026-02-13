import { MoveLeft, MoveRight, PanelLeft, PanelRight, PinOff, Settings2 } from "lucide-react"
import { type ReactNode, useMemo } from "react"
import { Button } from "@/packages/ui/button"
import { Checkbox } from "@/packages/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/packages/ui/dropdown-menu"
import { cn } from "@/packages/ui-utils"
import {
  type DataTableI18nOverrides,
  mergeDataTableI18n,
  useDataTableConfig,
} from "../config/provider"
import { useDataTableInstance } from "../table/context"

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
  const hasColumnVisibilityFeature = dt.meta.feature.columnVisibilityEnabled
  const hasPinning = dt.meta.feature.pinningEnabled
  const hasColumnOrder = dt.meta.feature.columnOrderEnabled
  const currentColumnOrder = dt.table.getState().columnOrder
  const effectiveColumnOrder = useMemo(() => {
    if (currentColumnOrder.length > 0) return currentColumnOrder
    return dt.table.getAllLeafColumns().map((column) => column.id)
  }, [currentColumnOrder, dt.table])

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

  const handleResetColumnVisibility = () => {
    if (hasColumnVisibilityFeature) {
      dt.actions.resetColumnVisibility()
      return
    }
    dt.table.resetColumnVisibility()
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
          <div className="flex items-center gap-1">
            {hasPinning ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => dt.actions.resetColumnPinning()}
              >
                {i18n.columnArrangement.resetPinningText}
              </Button>
            ) : null}
            {hasColumnOrder ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => dt.actions.resetColumnOrder()}
              >
                {i18n.columnArrangement.resetOrderText}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={handleResetColumnVisibility}
            >
              {i18n.columnToggle.resetText}
            </Button>
          </div>
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
          {columns.map((column) => {
            const label = getColumnLabel(column)
            const pinned = column.getIsPinned()
            const orderIndex = effectiveColumnOrder.indexOf(column.id)
            const canMoveLeft = orderIndex > 0
            const canMoveRight =
              orderIndex >= 0 && orderIndex < Math.max(0, effectiveColumnOrder.length - 1)

            return (
              <div
                key={column.id}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-2 hover:bg-accent"
              >
                <label
                  htmlFor={`dt-column-${column.id}`}
                  className="flex flex-1 cursor-pointer items-center gap-2"
                >
                  <Checkbox
                    id={`dt-column-${column.id}`}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(Boolean(value))}
                  />
                  <span className="flex-1 text-sm select-none">{label}</span>
                </label>
                {hasPinning || hasColumnOrder ? (
                  <div className="flex items-center gap-0.5">
                    {hasPinning ? (
                      <>
                        <Button
                          type="button"
                          variant={pinned === "left" ? "secondary" : "ghost"}
                          size="icon-xs"
                          className="h-6 w-6"
                          onClick={() =>
                            dt.actions.setColumnPin(column.id, pinned === "left" ? false : "left")
                          }
                          aria-label={i18n.columnArrangement.pinLeftAriaLabel(label)}
                        >
                          <PanelLeft className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant={pinned === "right" ? "secondary" : "ghost"}
                          size="icon-xs"
                          className="h-6 w-6"
                          onClick={() =>
                            dt.actions.setColumnPin(column.id, pinned === "right" ? false : "right")
                          }
                          aria-label={i18n.columnArrangement.pinRightAriaLabel(label)}
                        >
                          <PanelRight className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="h-6 w-6"
                          disabled={pinned === false}
                          onClick={() => dt.actions.setColumnPin(column.id, false)}
                          aria-label={i18n.columnArrangement.unpinAriaLabel(label)}
                        >
                          <PinOff className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : null}
                    {hasColumnOrder ? (
                      <>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="h-6 w-6"
                          disabled={!canMoveLeft}
                          onClick={() => dt.actions.moveColumn(column.id, "left")}
                          aria-label={i18n.columnArrangement.moveLeftAriaLabel(label)}
                        >
                          <MoveLeft className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="h-6 w-6"
                          disabled={!canMoveRight}
                          onClick={() => dt.actions.moveColumn(column.id, "right")}
                          aria-label={i18n.columnArrangement.moveRightAriaLabel(label)}
                        >
                          <MoveRight className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
