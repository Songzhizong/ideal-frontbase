import { Button } from "@/packages/ui/button"
import { cn } from "@/packages/ui-utils"
import { useDataTableConfig } from "../config/provider"
import { useDataTableInstance } from "../table/context"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

type DensityValue = "compact" | "comfortable"

function getDensity(meta: unknown): DensityValue | null {
  if (!isRecord(meta)) return null
  return meta.dtDensity === "compact" || meta.dtDensity === "comfortable" ? meta.dtDensity : null
}

function getSetDensity(meta: unknown): ((value: DensityValue) => void) | null {
  if (!isRecord(meta)) return null
  const value = meta.dtSetDensity
  return typeof value === "function" ? (value as (value: DensityValue) => void) : null
}

export interface DataTableDensityToggleProps {
  className?: string
}

export function DataTableDensityToggle({ className }: DataTableDensityToggleProps) {
  const dt = useDataTableInstance()
  const { i18n } = useDataTableConfig()

  const density = getDensity(dt.table.options.meta)
  const setDensity = getSetDensity(dt.table.options.meta)
  if (!density || !setDensity) return null

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-border/50 p-1",
        className,
      )}
    >
      <Button
        type="button"
        variant={density === "compact" ? "solid" : "ghost"}
        color={density === "compact" ? "secondary" : "primary"}
        size="sm"
        className="h-7 px-2"
        onClick={() => setDensity("compact")}
      >
        {i18n.density.compactText}
      </Button>
      <Button
        type="button"
        variant={density === "comfortable" ? "solid" : "ghost"}
        color={density === "comfortable" ? "secondary" : "primary"}
        size="sm"
        className="h-7 px-2"
        onClick={() => setDensity("comfortable")}
      >
        {i18n.density.comfortableText}
      </Button>
    </div>
  )
}
