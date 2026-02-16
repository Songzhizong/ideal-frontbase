import { Button, Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/packages/ui"

export function SheetLeftPanelDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">左侧面板</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>导航面板</SheetTitle>
        </SheetHeader>
        <div className="p-4 text-sm text-muted-foreground">适合做小型导航和目录。</div>
      </SheetContent>
    </Sheet>
  )
}

export default SheetLeftPanelDemo
