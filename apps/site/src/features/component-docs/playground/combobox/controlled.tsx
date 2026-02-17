import { useState } from "react"
import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList } from "@/packages/ui"

export function ComboboxControlledDemo() {
  const [value, setValue] = useState<string | null>("react")

  return (
    <div className="grid w-full max-w-sm gap-2">
      <Combobox value={value} onValueChange={(nextValue) => setValue(nextValue)}>
        <ComboboxInput placeholder="选择技术栈" showClear />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem value="react">React</ComboboxItem>
            <ComboboxItem value="vue">Vue</ComboboxItem>
            <ComboboxItem value="angular">Angular</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <p className="text-xs text-muted-foreground">
        当前值：
        {value || "未选择"}
      </p>
    </div>
  )
}

export default ComboboxControlledDemo
