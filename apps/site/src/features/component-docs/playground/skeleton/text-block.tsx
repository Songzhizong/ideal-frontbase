import { Skeleton } from "@/packages/ui"

export function SkeletonTextBlockDemo() {
  return (
    <div className="w-full max-w-md space-y-2">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

export default SkeletonTextBlockDemo
