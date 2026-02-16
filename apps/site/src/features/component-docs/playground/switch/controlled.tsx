import { useState } from "react"
import { Label, Switch } from "@/packages/ui"

export function SwitchControlledDemo() {
  const [checked, setChecked] = useState(true)

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <Switch id="switch-control" checked={checked} onCheckedChange={setChecked} />
        <Label htmlFor="switch-control">发布后自动通知订阅者</Label>
      </div>
      <p className="text-xs text-muted-foreground">当前状态：{checked ? "开启" : "关闭"}</p>
    </div>
  )
}

export default SwitchControlledDemo
