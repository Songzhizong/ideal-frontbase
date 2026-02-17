import { toast } from "sonner"
import { Button, Toaster } from "@/packages/ui"

export function SonnerBasicDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toaster id="sonner-basic" position="top-right" />
      <Button
        size="sm"
        onClick={() => {
          toast.success("配置已保存", {
            description: "变更已同步到当前环境。",
            toasterId: "sonner-basic",
          })
        }}
      >
        成功提示
      </Button>
      <Button
        size="sm"
        variant="solid"
        color="secondary"
        onClick={() => {
          toast.info("开始发布", {
            description: "正在构建产物，请稍候。",
            toasterId: "sonner-basic",
          })
        }}
      >
        信息提示
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          toast.warning("存在风险项", {
            description: "请先确认告警后再继续。",
            toasterId: "sonner-basic",
          })
        }}
      >
        警告提示
      </Button>
      <Button
        size="sm"
        variant="solid"
        color="destructive"
        onClick={() => {
          toast.error("发布失败", {
            description: "构建日志中存在错误。",
            toasterId: "sonner-basic",
          })
        }}
      >
        错误提示
      </Button>
    </div>
  )
}

export default SonnerBasicDemo
