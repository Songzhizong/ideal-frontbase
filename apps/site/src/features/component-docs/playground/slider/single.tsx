import { useState } from "react"
import { Slider } from "@/packages/ui"

export function SliderSingleDemo() {
  const [value, setValue] = useState([40])

  return (
    <div className="grid w-full max-w-md gap-2">
      <Slider value={value} onValueChange={setValue} max={100} step={1} />
      <p className="text-xs text-muted-foreground">当前值：{value[0]}%</p>
    </div>
  )
}

export default SliderSingleDemo
