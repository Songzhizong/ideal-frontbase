import { useState } from "react"
import { Button, Progress } from "@/packages/ui"

export function ProgressUploadFlowDemo() {
  const [value, setValue] = useState(15)

  return (
    <div className="w-full max-w-md space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">上传日志包</span>
        <span className="font-medium">{value}%</span>
      </div>
      <Progress value={value} aria-label={`上传进度 ${value}%`} />
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setValue((prev) => Math.min(prev + 10, 100))
          }}
        >
          +10%
        </Button>
        <Button
          size="sm"
          variant="solid"
          color="secondary"
          onClick={() => {
            setValue(100)
          }}
        >
          完成
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setValue(0)
          }}
        >
          重置
        </Button>
      </div>
    </div>
  )
}

export default ProgressUploadFlowDemo
