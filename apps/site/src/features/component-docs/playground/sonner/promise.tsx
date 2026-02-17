import { toast } from "sonner"
import { Button, Toaster } from "@/packages/ui"

function mockRequest() {
  return new Promise<string>((resolve) => {
    window.setTimeout(() => {
      resolve("订单 #A-1024")
    }, 1200)
  })
}

export function SonnerPromiseDemo() {
  return (
    <div className="flex items-center gap-2">
      <Toaster id="sonner-promise" />
      <Button
        onClick={() => {
          toast.promise(mockRequest(), {
            loading: "正在提交订单...",
            success: (orderId) => `提交成功：${orderId}`,
            error: "提交失败，请重试。",
            description: "该流程适合异步任务反馈。",
            toasterId: "sonner-promise",
          })
        }}
      >
        提交并追踪状态
      </Button>
    </div>
  )
}

export default SonnerPromiseDemo
