import { Input, Label } from "@/packages/ui"

export function InputStateInvalidDemo() {
  return (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="input-doc-invalid">邮箱</Label>
      <Input id="input-doc-invalid" aria-invalid value="invalid-email" />
      <p className="text-xs text-destructive">请输入正确的邮箱格式。</p>
    </div>
  )
}

export default InputStateInvalidDemo
