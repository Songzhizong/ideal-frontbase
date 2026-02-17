import { useState } from "react"
import { ColorPicker } from "@/packages/ui"

export function ColorPickerNoInputDemo() {
  const [color, setColor] = useState("#8b5cf6")

  return (
    <div className="space-y-2">
      <ColorPicker
        value={color}
        onChange={setColor}
        showInput={false}
        presets={["#8b5cf6", "#06b6d4", "#ec4899"]}
      />
      <p className="text-xs text-muted-foreground">仅色板模式：{color}</p>
    </div>
  )
}

export default ColorPickerNoInputDemo
