import { useRef } from "react"
import { BackTop } from "@/packages/ui"

export function BackTopBasicDemo() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  return (
    <div
      ref={containerRef}
      className="relative h-80 overflow-y-auto rounded-md border border-border/50 p-3"
    >
      <div className="space-y-3 pb-96 text-sm text-muted-foreground">
        {Array.from({ length: 30 }).map((_, index) => (
          <p key={`back-top-basic-${index + 1}`}>这是第 {index + 1} 行内容。</p>
        ))}
      </div>
      <BackTop target={() => containerRef.current} />
    </div>
  )
}

export default BackTopBasicDemo
