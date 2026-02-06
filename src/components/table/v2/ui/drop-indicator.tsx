import { cn } from "@/lib/utils"

export type DataTableDropIndicatorPosition = "above" | "below" | "inside"

export interface DataTableDropIndicatorProps {
  position: DataTableDropIndicatorPosition
  indentPx?: number
  className?: string
}

export function DataTableDropIndicator({
  position,
  indentPx = 0,
  className,
}: DataTableDropIndicatorProps) {
  const style = position === "inside" ? { left: indentPx } : undefined
  const base =
    "pointer-events-none absolute left-0 right-0 h-0.5 bg-primary animate-in fade-in duration-150"
  return (
    <div
      className={cn(
        base,
        position === "above" && "top-0",
        position === "below" && "bottom-0",
        position === "inside" && "bottom-0",
        className,
      )}
      style={style}
    />
  )
}
