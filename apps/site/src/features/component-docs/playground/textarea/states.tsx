import { Label, Textarea } from "@/packages/ui"

export function TextareaStatesDemo() {
  return (
    <div className="grid w-full max-w-md gap-4">
      <div className="grid gap-2">
        <Label htmlFor="textarea-disabled">禁用状态</Label>
        <Textarea id="textarea-disabled" disabled value="当前工单已关闭，不可编辑。" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="textarea-invalid">错误状态</Label>
        <Textarea
          id="textarea-invalid"
          aria-invalid
          defaultValue=""
          placeholder="请输入至少 20 个字"
        />
        <p className="text-xs text-destructive">描述过短，请补充更多上下文。</p>
      </div>
    </div>
  )
}

export default TextareaStatesDemo
