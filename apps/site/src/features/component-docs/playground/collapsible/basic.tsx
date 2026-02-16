import { ChevronDownIcon } from "lucide-react"
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/packages/ui"

export function CollapsibleBasicDemo() {
  return (
    <Collapsible className="w-full max-w-xl rounded-lg border border-border/60 p-4" defaultOpen>
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-medium">部署前检查项</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon-xs" aria-label="切换展开状态">
            <ChevronDownIcon className="size-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-3 space-y-1.5 text-sm text-muted-foreground">
        <p>1. 通过单元测试与类型检查。</p>
        <p>2. 完成灰度环境验证。</p>
        <p>3. 确认告警规则已同步。</p>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default CollapsibleBasicDemo
