import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/ui/card"
import { Skeleton } from "@/packages/ui/skeleton"

export function TenantOverviewLoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((id) => (
          <div
            key={`metric-${id}`}
            className="relative min-h-44 rounded-2xl border border-border/60 bg-card p-5"
          >
            <Skeleton className="absolute right-5 top-5 size-12 rounded-xl" />
            <div className="max-w-[72%] space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-3.5 w-36" />
            </div>
            <div className="mt-8">
              <Skeleton className="h-10 w-36" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card className="overflow-hidden border-border/60 bg-card py-0">
          <CardHeader className="space-y-2 px-6 pb-2 pt-5">
            <CardTitle className="text-xl font-semibold tracking-tight">每日成本 (¥)</CardTitle>
            <CardDescription>近 7 天成本变化趋势</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-2">
            <Skeleton className="h-75 w-full" />
          </CardContent>
        </Card>

        <Card className="border-border/50 py-0">
          <CardHeader className="space-y-1 border-b border-border/50 px-4 py-4">
            <CardTitle className="text-sm font-semibold">项目成本 Top 5</CardTitle>
            <CardDescription>按本月预估成本排序</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-4 py-4">
            {[0, 1, 2, 3, 4].map((id) => (
              <div key={`project-${id}`} className="rounded-md border border-border/50 p-3">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="mt-2 h-3 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 py-0">
        <CardHeader className="space-y-1 border-b border-border/50 px-4 py-4">
          <CardTitle className="text-sm font-semibold">最近审计事件</CardTitle>
          <CardDescription>最近发生的关键写操作事件</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 px-4 py-4">
          {[0, 1, 2, 3, 4].map((id) => (
            <div key={`audit-${id}`} className="space-y-2 rounded-md border border-border/50 p-3">
              <Skeleton className="h-3 w-72" />
              <Skeleton className="h-3 w-52" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
