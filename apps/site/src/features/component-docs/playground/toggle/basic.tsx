import { BoldIcon } from "lucide-react"
import { Toggle } from "@/packages/ui"

export function ToggleBasicDemo() {
  return (
    <Toggle aria-label="切换粗体">
      <BoldIcon aria-hidden />
      粗体
    </Toggle>
  )
}

export default ToggleBasicDemo
