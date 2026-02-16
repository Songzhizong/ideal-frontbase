import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/packages/ui"

export function ContextMenuSubmenuDemo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-32 w-72 items-center justify-center rounded-md border border-dashed border-border/70 text-sm text-muted-foreground">
        右键查看子菜单
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>打开</ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>共享设置</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>仅自己可见</ContextMenuItem>
            <ContextMenuItem>团队可见</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export default ContextMenuSubmenuDemo
