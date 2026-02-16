import {
  Button,
  Drawer,
  DrawerContent,
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
        </DrawerHeader>
        <div className="p-4 text-sm text-muted-foreground">适合展示筛选面板或辅助信息。</div>
      </DrawerContent>
    </Drawer>
  )
}

export default DrawerSideDemo
