import { useState } from "react"
import { Input, Label } from "@/packages/ui"

export function InputControlledDemo() {
  const [value, setValue] = useState("nexus-team")

  return (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="input-controlled">项目标识</Label>
      <Input
        id="input-controlled"
        value={value}
        onChange={(event) => {
          setValue(event.target.value)
        }}
      />
      <p className="text-xs text-muted-foreground">当前值：{value || "(空)"}</p>
    </div>
  )
}

export default InputControlledDemo
