import { ArrowBigUpDashIcon } from "lucide-react"
import { useRef } from "react"
import { BackTop } from "@/packages/ui"

export function BackTopCustomPositionDemo() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  return (
    <div ref={containerRef} className="h-80 overflow-y-auto rounded-md border border-border/50 p-3">
      <div className="space-y-3 pb-96 text-sm text-muted-foreground">
        {Array.from({ length: 24 }).map((_, index) => (
          <p key={`back-top-custom-${index + 1}`}>滚动查看更多示例行 {index + 1}</p>
        ))}
      </div>
      <BackTop target={() => containerRef.current} right={12} bottom={12} visibleHeight={120}>
        <ArrowBigUpDashIcon className="size-4" />
      </BackTop>
    </div>
  )
}

export default BackTopCustomPositionDemo
