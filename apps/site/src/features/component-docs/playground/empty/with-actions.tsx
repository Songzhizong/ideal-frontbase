import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/packages/ui"

export function EmptyWithActionsDemo() {
  return (
    <Empty className="w-full max-w-md border border-border/60">
      <EmptyHeader>
        <EmptyTitle>还没有项目成员</EmptyTitle>
        <EmptyDescription>邀请成员后即可分配任务与查看协作记录。</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-wrap justify-center gap-2">
          <Button size="sm">邀请成员</Button>
          <Button size="sm" variant="outline">
            查看帮助文档
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  )
}

export default EmptyWithActionsDemo
