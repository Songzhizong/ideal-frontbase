import {
  Button,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/packages/ui"

export function DrawerBasicBottomDemo() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">打开底部抽屉</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>移动端操作面板</DrawerTitle>
          <DrawerDescription>这里可放置快捷操作和确认按钮。</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button>确认</Button>
          <Button variant="outline">取消</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default DrawerBasicBottomDemo
