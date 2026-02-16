import { useState } from "react"
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/packages/ui"

export function DialogControlledDemo() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={() => setOpen(true)}>
        受控打开
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>受控弹窗</DialogTitle>
            <DialogDescription>当前 open 状态由父组件统一管理。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DialogControlledDemo
