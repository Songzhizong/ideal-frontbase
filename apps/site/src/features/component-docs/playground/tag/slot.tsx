import { SparklesIcon, XCircleIcon } from "lucide-react"
import { Tag } from "@/packages/ui"

export function TagSlotDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tag
        color="accent"
        variant="soft"
        closable
        closeSlot={<XCircleIcon aria-hidden className="size-4" />}
      >
        <SparklesIcon aria-hidden className="size-4" />
        自定义 closeSlot
      </Tag>
      <Tag asChild color="info" variant="link">
        <a href="https://soybeanjs.cn" target="_blank" rel="noopener noreferrer">
          使用 asChild 注入到链接
        </a>
      </Tag>
      <Tag color="warning" variant="outline" content="使用 content 作为默认插槽内容" />
    </div>
  )
}

export default TagSlotDemo
