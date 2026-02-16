import { ScrollArea } from "@/packages/ui"

const columns = ["待办", "进行中", "测试中", "已完成", "已归档"]

export function ScrollAreaHorizontalBoardDemo() {
  return (
    <ScrollArea
      className="w-full max-w-xl rounded-md border border-border/60"
      viewportClassName="p-3"
      scrollbars="horizontal"
    >
      <div className="flex min-w-[880px] gap-3">
        {columns.map((column) => (
          <div
            key={column}
            className="w-40 shrink-0 rounded border border-border/60 bg-muted/40 p-3 text-sm"
          >
            <p className="font-medium">{column}</p>
            <p className="mt-2 text-xs text-muted-foreground">拖拽卡片到此列管理流程。</p>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

export default ScrollAreaHorizontalBoardDemo
