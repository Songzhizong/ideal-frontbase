import { CheckCircle2Icon, Clock3Icon, XCircleIcon } from "lucide-react"
import { Tag } from "@/packages/ui"

export function TagWithIconDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tag>
        <CheckCircle2Icon />
        已发布
      </Tag>
      <Tag variant="solid" color="secondary">
        <Clock3Icon />
        待审核
      </Tag>
      <Tag variant="solid" color="destructive">
        <XCircleIcon />
        已驳回
      </Tag>
    </div>
  )
}

export default TagWithIconDemo
