import { CircleAlertIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle, Button } from "@/packages/ui"

export function AlertWithActionsDemo() {
  return (
    <Alert className="max-w-lg">
      <CircleAlertIcon />
      <AlertTitle>发现安全建议</AlertTitle>
      <AlertDescription>
        <p>检测到 2 条中风险项，建议尽快处理。</p>
        <div className="mt-2 flex items-center gap-2">
          <Button size="sm">立即修复</Button>
          <Button size="sm" variant="outline">
            稍后处理
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}

export default AlertWithActionsDemo
