import { Watermark } from "@/packages/ui"

export function WatermarkMultiLineDemo() {
  return (
    <Watermark
      content={["ideal-frontbase", "security-team"]}
      gap={[180, 120]}
      font={{ fontSize: 13, fontWeight: 600 }}
      className="rounded-lg border border-border/60"
    >
      <div className="h-48 p-4 text-sm text-muted-foreground">
        多行水印适合标记团队与环境信息，便于追踪截图来源。
      </div>
    </Watermark>
  )
}

export default WatermarkMultiLineDemo
