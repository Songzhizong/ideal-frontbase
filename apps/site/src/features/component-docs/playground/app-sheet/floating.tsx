import {
  AppSheetContent,
  Button,
  Sheet,
  SheetDescription,
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
          <SheetDescription>floating 模式带圆角与外边距。</SheetDescription>
        </SheetHeader>
      </AppSheetContent>
    </Sheet>
  )
}

export default AppSheetFloatingDemo
