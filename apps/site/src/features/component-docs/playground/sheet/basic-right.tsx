import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/packages/ui"

export function SheetBasicRightDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">打开 Sheet</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>筛选设置</SheetTitle>
          <SheetDescription>可在此调整筛选条件。</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}

export default SheetBasicRightDemo
