import { Card, CardContent, CardHeader } from "@/packages/ui/card"
import { Skeleton } from "@/packages/ui/skeleton"

export function ProjectDashboardLoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[0, 1, 2, 3, 4].map((item) => (
          <div
            key={`metric-${item}`}
            className="rounded-xl border border-border/50 bg-card p-5 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <Skeleton className="size-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-3.5 w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card className="overflow-hidden border-border/50 py-0">
          <CardHeader className="space-y-2 border-b border-border/50 px-4 py-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3.5 w-44" />
          </CardHeader>
          <CardContent className="space-y-3 px-4 py-4">
            {[0, 1, 2, 3].map((item) => (
              <Skeleton key={`deploy-${item}`} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/50 py-0">
          <CardHeader className="space-y-2 border-b border-border/50 px-4 py-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3.5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3 px-4 py-4">
            {[0, 1, 2].map((item) => (
              <Skeleton key={`alert-${item}`} className="h-14 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-border/50 py-0">
        <CardHeader className="space-y-2 border-b border-border/50 px-4 py-4">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3.5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3 px-4 py-4">
          {[0, 1, 2, 3].map((item) => (
            <Skeleton key={`audit-${item}`} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
