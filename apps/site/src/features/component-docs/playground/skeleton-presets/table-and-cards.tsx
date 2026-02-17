import { CardSkeleton, TableSkeleton } from "@/packages/ui"

export function SkeletonPresetsTableAndCardsDemo() {
  return (
    <div className="space-y-6">
      <TableSkeleton rows={4} columns={5} />
      <CardSkeleton cards={3} />
    </div>
  )
}

export default SkeletonPresetsTableAndCardsDemo
