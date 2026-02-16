import { SuperDateRangePicker } from "@/packages/ui"
import { superDateRangeQuickPresets } from "./shared"

export function SuperDateRangePickerBasicDemo() {
  return (
    <div className="w-full max-w-xl">
      <SuperDateRangePicker quickPresets={superDateRangeQuickPresets} />
    </div>
  )
}

export default SuperDateRangePickerBasicDemo
