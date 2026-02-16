import { useState } from "react"
import { Button, Watermark } from "@/packages/ui"

export function WatermarkCustomDemo() {
  const [rotate, setRotate] = useState(-20)

  return (
    <div className="space-y-2">
      <Watermark
        content="CONFIDENTIAL"
        rotate={rotate}
        opacity={0.2}
        gap={[140, 100]}
        offset={[4, 6]}
        observe
        className="rounded-lg border border-border/60"
      >
        <div className="h-48 p-4 text-sm text-muted-foreground">
          可动态调整旋转角度，模拟不同防泄漏策略。
        </div>
      </Watermark>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setRotate(-20)}>
          -20°
        </Button>
        <Button size="sm" variant="outline" onClick={() => setRotate(-35)}>
          -35°
        </Button>
      </div>
    </div>
  )
}

export default WatermarkCustomDemo
