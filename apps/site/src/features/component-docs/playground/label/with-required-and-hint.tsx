import { Input, Label } from "@/packages/ui"

export function LabelWithRequiredAndHintDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="label-required-email">
        邮箱
        <span className="text-destructive">*</span>
      </Label>
      <Input id="label-required-email" type="email" placeholder="name@company.com" />
      <p className="text-xs text-muted-foreground">用于接收系统通知，不会公开展示。</p>
    </div>
  )
}

export default LabelWithRequiredAndHintDemo
