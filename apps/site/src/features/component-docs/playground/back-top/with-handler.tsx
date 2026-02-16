import { useRef, useState } from "react"
import { BackTop } from "@/packages/ui"

export function BackTopWithHandlerDemo() {
  const [count, setCount] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)

  return (
    <div ref={containerRef} className="h-80 overflow-y-auto rounded-md border border-border/50 p-3">
      <div className="space-y-3 pb-96 text-sm text-muted-foreground">
        {Array.from({ length: 26 }).map((_, index) => (
          <p key={`back-top-handler-${index + 1}`}>滚动内容 {index + 1}</p>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">触发次数：{count}</p>

      <BackTop
        target={() => containerRef.current}
        onClick={(_, scrollToTop) => {
          setCount((current) => current + 1)
          scrollToTop()
        }}
      />
    </div>
  )
}

export default BackTopWithHandlerDemo
