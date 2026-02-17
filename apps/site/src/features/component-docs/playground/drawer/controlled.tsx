import { useState } from "react"
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/packages/ui"

export function DrawerControlledDemo() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={() => setOpen(true)}>
        受控抽屉
      </Button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>受控状态</DrawerTitle>
            <DrawerDescription>通过外部状态控制抽屉的打开与关闭。</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button onClick={() => setOpen(false)}>关闭</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default DrawerControlledDemo
