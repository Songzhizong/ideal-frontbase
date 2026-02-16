import {
  AppSheetContent,
  Button,
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/packages/ui"

export function AppSheetFloatingDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Floating App Sheet</Button>
      </SheetTrigger>
      <AppSheetContent side="right" variant="floating">
        <SheetHeader>
          <SheetTitle>应用侧栏</SheetTitle>
        </SheetHeader>
        <div className="p-4 text-sm text-muted-foreground">floating 模式带圆角与外边距。</div>
      </AppSheetContent>
    </Sheet>
  )
}

export default AppSheetFloatingDemo
