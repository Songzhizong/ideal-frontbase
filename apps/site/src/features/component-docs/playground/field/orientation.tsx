import { Field, FieldDescription, FieldLabel } from "@/packages/ui"
import { Input } from "@/packages/ui/input"

export function FieldOrientationDemo() {
  return (
    <div className="grid max-w-xl gap-4">
      <Field orientation="horizontal">
        <FieldLabel htmlFor="field-horizontal">负责人</FieldLabel>
        <Input id="field-horizontal" placeholder="请输入负责人" />
      </Field>

      <Field orientation="responsive">
        <FieldLabel htmlFor="field-responsive">Webhook 地址</FieldLabel>
        <Input id="field-responsive" placeholder="https://example.com/webhook" />
        <FieldDescription>响应式模式下，小屏竖排，大屏横排。</FieldDescription>
      </Field>
    </div>
  )
}

export default FieldOrientationDemo
