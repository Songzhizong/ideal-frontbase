import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/packages/ui"

export function SheetLeftPanelDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">左侧面板</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>导航面板</SheetTitle>
          <SheetDescription>适合做小型导航和目录。</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}

export default SheetLeftPanelDemo
