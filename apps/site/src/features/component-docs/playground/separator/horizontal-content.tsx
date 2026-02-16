import { Separator } from "@/packages/ui"

export function SeparatorHorizontalContentDemo() {
  return (
    <div className="w-full max-w-md space-y-3">
      <p className="text-sm font-medium">概览</p>
      <Separator />
      <p className="text-sm text-muted-foreground">分隔内容块，增强阅读节奏。</p>
    </div>
  )
}

export default SeparatorHorizontalContentDemo
