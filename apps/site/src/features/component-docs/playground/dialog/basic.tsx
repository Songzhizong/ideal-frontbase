import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/packages/ui"

export function DialogBasicDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">打开弹窗</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建新版本</DialogTitle>
          <DialogDescription>填写版本说明后发布。</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">取消</Button>
          <Button>继续</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DialogBasicDemo
