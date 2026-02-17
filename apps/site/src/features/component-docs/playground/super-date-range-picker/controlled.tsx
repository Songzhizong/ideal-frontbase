import { useState } from "react"
import type { ResolvedPayload, TimeRangeDefinition } from "@/packages/ui"
import { SuperDateRangePicker } from "@/packages/ui"
import { superDateRangeQuickPresets } from "./shared"

export function SuperDateRangePickerControlledDemo() {
  const [value, setValue] = useState<TimeRangeDefinition | null>({
    from: { expr: "now-30m" },
    to: { expr: "now" },
    label: "最近 30 分钟",
    ui: { editorMode: "relative" },
  })
  const [resolved, setResolved] = useState<ResolvedPayload | null>(null)

  return (
    <div className="w-full max-w-xl space-y-2">
      <SuperDateRangePicker
        value={value}
        quickPresets={superDateRangeQuickPresets}
        onResolvedChange={(payload) => {
          setResolved(payload)
          if (payload) {
            setValue(payload.definition)
          }
        }}
      />
      <p className="text-xs text-muted-foreground">
        已解析：{resolved ? `${resolved.resolved.startIso} ~ ${resolved.resolved.endIso}` : "暂无"}
      </p>
    </div>
  )
}

export default SuperDateRangePickerControlledDemo
