import { useState } from "react"
import { Label, RadioGroup, RadioGroupItem } from "@/packages/ui"

export function RadioGroupControlledDemo() {
  const [value, setValue] = useState("manual")

  return (
    <div className="grid gap-3">
      <RadioGroup value={value} onValueChange={setValue}>
        <div className="flex items-center gap-2">
          <RadioGroupItem id="strategy-manual" value="manual" />
          <Label htmlFor="strategy-manual">手动触发</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem id="strategy-auto" value="auto" />
          <Label htmlFor="strategy-auto">自动触发</Label>
        </div>
      </RadioGroup>
      <p className="text-xs text-muted-foreground">
        当前策略：{value === "manual" ? "手动" : "自动"}
      </p>
    </div>
  )
}

export default RadioGroupControlledDemo
