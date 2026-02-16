import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/packages/ui"

export function ResizableHorizontalDemo() {
  return (
    <div className="h-64 w-full max-w-3xl rounded-lg border border-border/60">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={30} minSize={20}>
          <div className="flex h-full items-center justify-center bg-muted/30 text-sm text-muted-foreground">
            左侧导航区
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70} minSize={40}>
          <div className="flex h-full items-center justify-center text-sm">右侧内容区</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default ResizableHorizontalDemo
