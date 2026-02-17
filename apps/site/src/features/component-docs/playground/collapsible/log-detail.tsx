import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/packages/ui"

export function CollapsibleLogDetailDemo() {
  return (
    <Collapsible className="w-full max-w-xl rounded-lg border border-border/60" defaultOpen={false}>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-medium">查看错误堆栈</span>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            展开详情
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="border-t border-border/60 px-4 py-3">
        <pre className="overflow-x-auto rounded bg-muted/50 p-3 text-xs text-muted-foreground">
          {`Error: Request timeout
  at fetchMetrics (metrics.ts:42)
  at async syncDashboard (dashboard.ts:88)`}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default CollapsibleLogDetailDemo
