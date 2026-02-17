import {
  AppSheetContent,
  Button,
  Sheet,
  SheetDescription,
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
          <SheetDescription>用于展示顶部提示信息或快捷操作。</SheetDescription>
        </SheetHeader>
      </AppSheetContent>
    </Sheet>
  )
}

export default AppSheetTopFloatingDemo
