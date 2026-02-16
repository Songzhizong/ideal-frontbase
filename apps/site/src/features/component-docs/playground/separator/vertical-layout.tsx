import { Separator } from "@/packages/ui"

export function SeparatorVerticalLayoutDemo() {
  return (
    <div className="flex h-10 items-center gap-3 text-sm text-muted-foreground">
      <span>筛选</span>
      <Separator orientation="vertical" />
      <span>排序</span>
      <Separator orientation="vertical" />
      <span>导出</span>
    </div>
  )
}

export default SeparatorVerticalLayoutDemo
