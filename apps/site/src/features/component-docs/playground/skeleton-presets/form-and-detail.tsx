import { DetailSkeleton, FormSkeleton } from "@/packages/ui"

export function SkeletonPresetsFormAndDetailDemo() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <FormSkeleton rows={3} actions />
      <DetailSkeleton rows={5} />
    </div>
  )
}

export default SkeletonPresetsFormAndDetailDemo
