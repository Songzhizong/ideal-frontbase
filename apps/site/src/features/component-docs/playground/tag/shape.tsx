import { CircleDotIcon } from "lucide-react"
import { Tag, tagShapeOptions } from "@/packages/ui"

export function TagShapeDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tagShapeOptions.map((shape) => (
        <Tag key={shape} shape={shape} variant="outline" color="info" content={shape} />
      ))}
      <Tag shape="circle" variant="solid" color="accent">
        <CircleDotIcon aria-hidden />
      </Tag>
      <Tag shape="square" variant="solid" color="success">
        <CircleDotIcon aria-hidden />
      </Tag>
    </div>
  )
}

export default TagShapeDemo
