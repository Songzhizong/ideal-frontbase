import { useState } from "react"
import { Mentions } from "@/packages/ui"

const OPTIONS = [
  { value: "ops", label: "运维" },
  { value: "security", label: "安全" },
  { value: "pm", label: "产品" },
]

export function MentionsControlledDemo() {
  const [value, setValue] = useState("")

  return (
    <div className="grid w-full max-w-lg gap-2">
      <Mentions
        value={value}
        onChange={setValue}
        options={OPTIONS}
        rows={4}
        placeholder="输入 @ 通知相关角色"
      />
      <p className="text-xs text-muted-foreground">当前内容长度：{value.length}</p>
    </div>
  )
}

export default MentionsControlledDemo
