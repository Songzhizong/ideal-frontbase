import { toast } from "sonner"
import { Button, Toaster } from "@/packages/ui"

export function SonnerActionDemo() {
  return (
    <div className="flex items-center gap-2">
      <Toaster id="sonner-action" closeButton />
      <Button
        variant="outline"
        onClick={() => {
          toast("检测到新版本", {
            description: "v1.4.2 已可用，建议先查看变更日志。",
            action: {
              label: "查看变更",
              onClick: () => {
                toast.info("已打开变更日志", {
                  toasterId: "sonner-action",
                })
              },
            },
            cancel: {
              label: "稍后处理",
              onClick: () => {
                toast.message("已加入稍后提醒", {
                  toasterId: "sonner-action",
                })
              },
            },
            toasterId: "sonner-action",
          })
        }}
      >
        操作型通知
      </Button>
    </div>
  )
}

export default SonnerActionDemo
