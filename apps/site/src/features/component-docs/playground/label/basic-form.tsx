import { Input, Label } from "@/packages/ui"

export function LabelBasicFormDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="label-basic-name">名称</Label>
      <Input id="label-basic-name" placeholder="请输入名称" />
    </div>
  )
}

export default LabelBasicFormDemo
