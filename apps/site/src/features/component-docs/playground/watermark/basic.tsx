import { Watermark } from "@/packages/ui"

export function WatermarkBasicDemo() {
  return (
    <Watermark content="INTERNAL USE" className="rounded-lg border border-border/60">
      <div className="h-48 p-4">
        <h4 className="text-sm font-medium">内部运营报表</h4>
        <p className="mt-2 text-sm text-muted-foreground">该页面仅限内部成员访问，请勿外传截图。</p>
      </div>
    </Watermark>
  )
}

export default WatermarkBasicDemo
