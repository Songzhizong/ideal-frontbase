import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/packages/ui"

export function ToggleGroupSingleDemo() {
  return (
    <ToggleGroup type="single" defaultValue="left" aria-label="文本对齐方式">
      <ToggleGroupItem value="left" aria-label="左对齐">
        <AlignLeftIcon aria-hidden />
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="居中对齐">
        <AlignCenterIcon aria-hidden />
      </ToggleGroupItem>
      <ToggleGroupItem value="right" aria-label="右对齐">
        <AlignRightIcon aria-hidden />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

export default ToggleGroupSingleDemo
