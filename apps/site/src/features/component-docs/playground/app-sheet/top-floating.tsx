import {
  AppSheetContent,
  Button,
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/packages/ui"

export function AppSheetTopFloatingDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">顶部 Floating</Button>
      </SheetTrigger>
      <AppSheetContent side="top" variant="floating">
        <SheetHeader>
          <SheetTitle>顶部浮动面板</SheetTitle>
        </SheetHeader>
      </AppSheetContent>
    </Sheet>
  )
}

export default AppSheetTopFloatingDemo
