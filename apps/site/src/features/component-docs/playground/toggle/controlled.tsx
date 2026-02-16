import { ItalicIcon } from "lucide-react"
import { useState } from "react"
import { Toggle } from "@/packages/ui"

export function ToggleControlledDemo() {
  const [pressed, setPressed] = useState(true)

  return (
    <div className="space-y-2">
      <Toggle pressed={pressed} onPressedChange={setPressed} aria-label="切换斜体">
        <ItalicIcon aria-hidden />
        斜体
      </Toggle>
      <p className="text-xs text-muted-foreground">当前状态：{pressed ? "开启" : "关闭"}</p>
    </div>
  )
}

export default ToggleControlledDemo
