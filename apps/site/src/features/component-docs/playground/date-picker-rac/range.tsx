import { useState } from "react"
import { DateRangePicker } from "@/packages/ui"

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function DatePickerRacRangeDemo() {
  const [value, setValue] = useState<{ from: Date | undefined; to?: Date | undefined } | undefined>(
    {
      from: new Date(),
      to: addDays(new Date(), 6),
    },
  )

  return (
    <div className="space-y-2">
      <DateRangePicker value={value} onChange={setValue} />
      <p className="text-xs text-muted-foreground">
        区间：{value?.from ? value.from.toLocaleDateString("zh-CN") : "-"} ~{" "}
        {value?.to ? value.to.toLocaleDateString("zh-CN") : "-"}
      </p>
    </div>
  )
}

export default DatePickerRacRangeDemo
