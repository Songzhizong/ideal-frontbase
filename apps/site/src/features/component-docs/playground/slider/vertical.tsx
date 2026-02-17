import { useState } from "react"
import { Slider } from "@/packages/ui"

export function SliderVerticalDemo() {
  const [value, setValue] = useState([60])

  return (
    <div className="flex h-52 items-end gap-4">
      <Slider
        orientation="vertical"
        className="h-44"
        min={0}
        max={100}
        value={value}
        onValueChange={setValue}
      />
      <p className="text-xs text-muted-foreground">音量：{value[0]}%</p>
    </div>
  )
}

export default SliderVerticalDemo
