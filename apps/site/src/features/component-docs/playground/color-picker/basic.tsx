import { useState } from "react"
import { ColorPicker } from "@/packages/ui"

export function ColorPickerBasicDemo() {
  const [color, setColor] = useState("#1677ff")

  return (
    <div className="space-y-2">
      <ColorPicker value={color} onChange={setColor} />
      <p className="text-xs text-muted-foreground">当前颜色：{color}</p>
    </div>
  )
}

export default ColorPickerBasicDemo
