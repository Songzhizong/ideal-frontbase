import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
} from "@/packages/ui"

export function DialogFormContentDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">编辑信息</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑成员信息</DialogTitle>
          <DialogDescription>请更新成员的基础资料，然后点击保存。</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="dialog-name">姓名</Label>
            <Input id="dialog-name" defaultValue="Alice" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dialog-role">角色</Label>
            <Input id="dialog-role" defaultValue="Maintainer" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline">取消</Button>
          <Button>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DialogFormContentDemo
