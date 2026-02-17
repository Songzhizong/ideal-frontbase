import { useState } from "react"
import type { TimeZoneMode } from "@/packages/ui"
import { SuperDateRangePicker } from "@/packages/ui"
import { superDateRangeQuickPresets } from "./shared"

export function SuperDateRangePickerTimezoneDemo() {
  const [timezone, setTimezone] = useState<TimeZoneMode>({ kind: "browser" })

  return (
    <div className="w-full max-w-xl space-y-2">
      <SuperDateRangePicker
        quickPresets={superDateRangeQuickPresets}
        timezone={timezone}
        onTimezoneChange={setTimezone}
        timezoneOptions={[
          { kind: "browser" },
          { kind: "utc" },
          { kind: "iana", tz: "Asia/Shanghai" },
          { kind: "iana", tz: "America/Los_Angeles" },
        ]}
      />
      <p className="text-xs text-muted-foreground">
        当前时区：{timezone.kind === "iana" ? timezone.tz : timezone.kind}
      </p>
    </div>
  )
}

export default SuperDateRangePickerTimezoneDemo
