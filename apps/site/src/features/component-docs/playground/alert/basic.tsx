import { InfoIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/packages/ui"

export function AlertBasicDemo() {
  return (
    <Alert className="max-w-lg">
      <InfoIcon />
      <AlertTitle>配置已保存</AlertTitle>
      <AlertDescription>你的修改已同步到当前环境。</AlertDescription>
    </Alert>
  )
}

export default AlertBasicDemo
