import {
  AppSheetContent,
  Button,
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/packages/ui"

export function AppSheetFlushDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Flush App Sheet</Button>
      </SheetTrigger>
      <AppSheetContent side="left" variant="flush">
        <SheetHeader>
          <SheetTitle>贴边侧栏</SheetTitle>
        </SheetHeader>
        <div className="p-4 text-sm text-muted-foreground">flush 模式保持默认 Sheet 边缘布局。</div>
      </AppSheetContent>
    </Sheet>
  )
}

export default AppSheetFlushDemo
