import { LayoutGrid, List } from "lucide-react"
import { Button } from "@/packages/ui/button"
import type { ViewMode } from "./project-models-page.helpers"

interface ViewModeToggleProps {
  value: ViewMode
  onValueChange: (value: ViewMode) => void
}

export function ViewModeToggle({ value, onValueChange }: ViewModeToggleProps) {
  return (
    <div className="inline-flex rounded-md border border-border/60 bg-card p-1">
      <Button
        type="button"
        variant={value === "list" ? "secondary" : "ghost"}
        size="sm"
        className="cursor-pointer"
        onClick={() => onValueChange("list")}
      >
        <List className="size-4" aria-hidden />
        List
      </Button>
      <Button
        type="button"
        variant={value === "grid" ? "secondary" : "ghost"}
        size="sm"
        className="cursor-pointer"
        onClick={() => onValueChange("grid")}
      >
        <LayoutGrid className="size-4" aria-hidden />
        Grid
      </Button>
    </div>
  )
}
