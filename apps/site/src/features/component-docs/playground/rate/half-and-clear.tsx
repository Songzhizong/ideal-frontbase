import { useState } from "react"
import { Rate } from "@/packages/ui"

export function RateHalfAndClearDemo() {
  const [value, setValue] = useState(3.5)

  return (
    <div className="grid gap-2">
      <Rate value={value} onChange={setValue} allowHalf allowClear />
      <p className="text-xs text-muted-foreground">当前评分：{value}</p>
    </div>
  )
}

export default RateHalfAndClearDemo
