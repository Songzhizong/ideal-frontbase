import { Rate } from "@/packages/ui"

export function RateDisabledDemo() {
  return (
    <div className="flex items-center gap-3">
      <Rate defaultValue={4} disabled />
      <span className="text-xs text-muted-foreground">评分已锁定</span>
    </div>
  )
}

export default RateDisabledDemo
