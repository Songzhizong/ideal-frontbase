import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/packages/ui"

export function ContextMenuBasicDemo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-32 w-72 items-center justify-center rounded-md border border-dashed border-border/70 text-sm text-muted-foreground">
        在此区域点击右键
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>复制</ContextMenuItem>
        <ContextMenuItem>粘贴</ContextMenuItem>
        <ContextMenuItem>重命名</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export default ContextMenuBasicDemo
