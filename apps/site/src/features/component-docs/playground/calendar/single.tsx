import { zhCN } from "date-fns/locale"
import { useState } from "react"
import { Calendar } from "@/packages/ui"

export function CalendarSingleDemo() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="space-y-2">
      <Calendar
        locale={zhCN}
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border border-border/60"
      />
      <p className="text-xs text-muted-foreground">
        已选日期：{date ? date.toLocaleDateString("zh-CN") : "未选择"}
      </p>
    </div>
  )
}

export default CalendarSingleDemo
