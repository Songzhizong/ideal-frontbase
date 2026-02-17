import { useState } from "react"
import { Slider } from "@/packages/ui"

export function SliderRangeDemo() {
  const [range, setRange] = useState([20, 80])

  return (
    <div className="grid w-full max-w-md gap-2">
      <Slider value={range} onValueChange={setRange} min={0} max={100} step={1} />
      <p className="text-xs text-muted-foreground">
        范围：{range[0]} - {range[1]}
      </p>
    </div>
  )
}

export default SliderRangeDemo
