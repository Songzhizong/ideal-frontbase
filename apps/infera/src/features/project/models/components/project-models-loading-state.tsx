import { Card, CardContent } from "@/packages/ui/card"
import { Skeleton } from "@/packages/ui/skeleton"
import { cn } from "@/packages/ui-utils"
import type { ViewMode } from "./project-models-page.helpers"

const GRID_LOADING_KEYS = [
  "grid-loading-1",
  "grid-loading-2",
  "grid-loading-3",
  "grid-loading-4",
  "grid-loading-5",
  "grid-loading-6",
]

const LIST_LOADING_KEYS = ["list-loading-1", "list-loading-2", "list-loading-3", "list-loading-4"]

interface ProjectModelsLoadingStateProps {
  viewMode: ViewMode
}

export function ProjectModelsLoadingState({ viewMode }: ProjectModelsLoadingStateProps) {
  const keys = viewMode === "grid" ? GRID_LOADING_KEYS : LIST_LOADING_KEYS

  return (
    <div
      className={cn(viewMode === "grid" ? "grid gap-3 md:grid-cols-2 xl:grid-cols-3" : "space-y-3")}
    >
      {keys.map((key) => (
        <Card key={key} className="border-border/60">
          <CardContent className="space-y-2 p-4">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
