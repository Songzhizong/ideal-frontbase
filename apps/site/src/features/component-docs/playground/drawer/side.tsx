import {
  Button,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/packages/ui"

export function DrawerSideDemo() {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline">打开右侧抽屉</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>侧边面板</DrawerTitle>
          <DrawerDescription>适合展示筛选面板或辅助信息。</DrawerDescription>
        </DrawerHeader>
      </DrawerContent>
    </Drawer>
  )
}

export default DrawerSideDemo
