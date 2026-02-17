import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/packages/ui"

export function ResizableThreeColumnsDemo() {
  return (
    <div className="h-64 w-full max-w-4xl rounded-lg border border-border/60">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={22} minSize={16}>
          <div className="flex h-full items-center justify-center bg-muted/30 text-xs">目录</div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="flex h-full items-center justify-center text-xs">编辑器</div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={28} minSize={18}>
          <div className="flex h-full items-center justify-center bg-muted/30 text-xs">预览</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default ResizableThreeColumnsDemo
