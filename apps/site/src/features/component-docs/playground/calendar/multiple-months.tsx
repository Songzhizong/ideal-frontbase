import { zhCN } from "date-fns/locale"
import { Calendar } from "@/packages/ui"

export function CalendarMultipleMonthsDemo() {
  return (
    <Calendar
      locale={zhCN}
      mode="single"
      defaultMonth={new Date(2026, 1, 1)}
      numberOfMonths={2}
      captionLayout="dropdown"
      showWeekNumber
      className="rounded-md border border-border/60"
    />
  )
}

export default CalendarMultipleMonthsDemo
