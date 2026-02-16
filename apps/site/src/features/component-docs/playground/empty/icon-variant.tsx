import { InboxIcon } from "lucide-react"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/packages/ui"

export function EmptyIconVariantDemo() {
  return (
    <Empty className="w-full max-w-md border border-border/60">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <InboxIcon aria-hidden />
        </EmptyMedia>
        <EmptyTitle>收件箱为空</EmptyTitle>
        <EmptyDescription>你可以创建第一条消息，开始本周工作流。</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

export default EmptyIconVariantDemo
