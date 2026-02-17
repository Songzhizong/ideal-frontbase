import { Skeleton } from "@/packages/ui"

export function SkeletonCardLoadingDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-3 md:grid-cols-2">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={`skeleton-card-${index + 1}`}
          className="space-y-3 rounded-lg border border-border/50 p-4"
        >
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ))}
    </div>
  )
}

export default SkeletonCardLoadingDemo
