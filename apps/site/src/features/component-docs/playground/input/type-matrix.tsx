import { Input, Label } from "@/packages/ui"

export function InputTypeMatrixDemo() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <div className="grid gap-1.5">
        <Label htmlFor="input-type-email">邮箱</Label>
        <Input id="input-type-email" type="email" placeholder="team@example.com" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="input-type-password">密码</Label>
        <Input id="input-type-password" type="password" placeholder="请输入密码" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="input-type-number">并发上限</Label>
        <Input id="input-type-number" type="number" min={1} max={50} defaultValue={8} />
      </div>
    </div>
  )
}

export default InputTypeMatrixDemo
