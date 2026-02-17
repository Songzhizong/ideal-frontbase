import { useState } from "react"
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/packages/ui"

export function ContextMenuCheckboxRadioDemo() {
  const [showHidden, setShowHidden] = useState(false)
  const [order, setOrder] = useState("name")

  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-32 w-72 items-center justify-center rounded-md border border-dashed border-border/70 text-sm text-muted-foreground">
        右键查看排序选项
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuCheckboxItem checked={showHidden} onCheckedChange={setShowHidden}>
          显示隐藏文件
        </ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup value={order} onValueChange={setOrder}>
          <ContextMenuRadioItem value="name">按名称排序</ContextMenuRadioItem>
          <ContextMenuRadioItem value="time">按时间排序</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export default ContextMenuCheckboxRadioDemo
