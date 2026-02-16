import { useState } from "react"
import { ColorPicker } from "@/packages/ui"

export function ColorPickerPresetsDemo() {
  const [color, setColor] = useState("#22c55e")

  return (
    <div className="space-y-2">
      <ColorPicker
        value={color}
        onChange={setColor}
        presets={["#1677ff", "#22c55e", "#f59e0b", "#ef4444", "#111827"]}
      />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>主题色预览</span>
        <span
          className="inline-flex h-4 w-10 rounded border border-border/60"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export default ColorPickerPresetsDemo
