import { AlertTriangleIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/packages/ui"

export function AlertDestructiveDemo() {
  return (
    <Alert variant="destructive" className="max-w-lg">
      <AlertTriangleIcon />
      <AlertTitle>发布失败</AlertTitle>
      <AlertDescription>部署任务执行超时，请检查网络与权限配置后重试。</AlertDescription>
    </Alert>
  )
}

export default AlertDestructiveDemo
