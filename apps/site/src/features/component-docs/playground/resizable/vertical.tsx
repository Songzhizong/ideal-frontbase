import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/packages/ui"

export function ResizableVerticalDemo() {
  return (
    <div className="h-72 w-full max-w-3xl rounded-lg border border-border/60">
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={40} minSize={25}>
          <div className="flex h-full items-center justify-center bg-muted/30 text-sm text-muted-foreground">
            上半区：实时日志
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60} minSize={35}>
          <div className="flex h-full items-center justify-center text-sm">下半区：详情面板</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

export default ResizableVerticalDemo
