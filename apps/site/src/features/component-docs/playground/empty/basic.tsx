import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/packages/ui"

export function EmptyBasicDemo() {
  return (
    <Empty className="w-full max-w-md border border-border/60">
      <EmptyHeader>
        <EmptyTitle>暂无数据</EmptyTitle>
        <EmptyDescription>当前筛选条件下没有可展示内容。</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

export default EmptyBasicDemo
