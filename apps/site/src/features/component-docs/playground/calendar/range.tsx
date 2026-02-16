import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { Calendar } from "@/packages/ui"

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function CalendarRangeDemo() {
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 4),
  })

  return (
    <div className="space-y-2">
      <Calendar
        mode="range"
        selected={range}
        onSelect={setRange}
        numberOfMonths={2}
        className="rounded-md border border-border/60"
      />
      <p className="text-xs text-muted-foreground">
        已选区间：
        {range?.from ? range.from.toLocaleDateString("zh-CN") : "-"} ~{" "}
        {range?.to ? range.to.toLocaleDateString("zh-CN") : "-"}
      </p>
    </div>
  )
}

export default CalendarRangeDemo
