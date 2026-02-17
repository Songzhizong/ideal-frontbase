import { useState } from "react"
import { CopyButton } from "@/packages/ui"

export function CopyButtonCallbackDemo() {
  const [result, setResult] = useState("未复制")

  return (
    <div className="space-y-2">
      <CopyButton
        value="workspace-prod"
        onCopy={async (_value, copied) => {
          setResult(copied ? "复制成功" : "复制失败")
        }}
      >
        复制工作区 ID
      </CopyButton>
      <p className="text-xs text-muted-foreground">回调状态：{result}</p>
    </div>
  )
}

export default CopyButtonCallbackDemo
