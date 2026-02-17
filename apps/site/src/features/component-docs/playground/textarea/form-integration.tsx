import { useMemo, useState } from "react"
import { Button, Label, Textarea } from "@/packages/ui"

const LIMIT = 200

export function TextareaFormIntegrationDemo() {
  const [value, setValue] = useState("")
  const remaining = useMemo(() => LIMIT - value.length, [value.length])

  return (
    <div className="grid w-full max-w-md gap-2">
      <Label htmlFor="textarea-feedback">反馈内容</Label>
      <Textarea
        id="textarea-feedback"
        maxLength={LIMIT}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="请输入你的建议"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>建议包含场景、问题和期望结果。</span>
        <span>剩余 {remaining} 字</span>
      </div>
      <Button disabled={value.trim().length < 10}>提交反馈</Button>
    </div>
  )
}

export default TextareaFormIntegrationDemo
