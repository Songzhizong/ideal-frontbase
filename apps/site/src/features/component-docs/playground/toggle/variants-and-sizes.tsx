import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from "lucide-react"
import { Toggle } from "@/packages/ui"

export function ToggleVariantsAndSizesDemo() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Toggle size="sm" aria-label="左对齐">
          <AlignLeftIcon aria-hidden />
        </Toggle>
        <Toggle size="default" aria-label="居中">
          <AlignCenterIcon aria-hidden />
        </Toggle>
        <Toggle size="lg" aria-label="右对齐">
          <AlignRightIcon aria-hidden />
        </Toggle>
      </div>
      <div className="flex items-center gap-2">
        <Toggle variant="outline" pressed aria-label="Outline 按钮">
          Outline
        </Toggle>
        <Toggle disabled aria-label="禁用开关">
          Disabled
        </Toggle>
      </div>
    </div>
  )
}

export default ToggleVariantsAndSizesDemo
