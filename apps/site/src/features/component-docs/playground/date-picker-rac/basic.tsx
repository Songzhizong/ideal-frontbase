import { useState } from "react"
import { DatePicker } from "@/packages/ui"

export function DatePickerRacBasicDemo() {
  const [value, setValue] = useState<Date | undefined>(new Date())

  return (
    <div className="space-y-2">
      <DatePicker value={value} onChange={setValue} />
      <p className="text-xs text-muted-foreground">
        当前值：{value ? value.toLocaleDateString("zh-CN") : "未选择"}
      </p>
    </div>
  )
}

export default DatePickerRacBasicDemo
