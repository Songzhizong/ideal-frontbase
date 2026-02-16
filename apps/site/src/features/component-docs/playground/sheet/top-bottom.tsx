import { Button, Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/packages/ui"

export function SheetTopBottomDemo() {
  return (
    <div className="flex items-center gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">顶部 Sheet</Button>
        </SheetTrigger>
        <SheetContent side="top" className="max-h-56">
          <SheetHeader>
            <SheetTitle>顶部公告</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">底部 Sheet</Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-56">
          <SheetHeader>
            <SheetTitle>底部操作区</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default SheetTopBottomDemo
