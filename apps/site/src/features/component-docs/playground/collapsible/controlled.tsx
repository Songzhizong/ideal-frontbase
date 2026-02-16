import { useState } from "react"
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/packages/ui"

export function CollapsibleControlledDemo() {
  const [open, setOpen] = useState(false)

  return (
    <div className="w-full max-w-xl space-y-2">
      <p className="text-xs text-muted-foreground">当前状态：{open ? "已展开" : "已折叠"}</p>
      <Collapsible
        open={open}
        onOpenChange={setOpen}
        className="rounded-lg border border-border/60 p-4"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">高级配置</h4>
          <CollapsibleTrigger asChild>
            <Button size="sm" variant="outline">
              {open ? "收起" : "展开"}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="mt-3 text-sm text-muted-foreground">
          受控模式适合与外部状态管理联动，如持久化用户偏好。
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export default CollapsibleControlledDemo
