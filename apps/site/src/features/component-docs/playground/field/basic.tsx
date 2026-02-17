import { Field, FieldDescription, FieldLabel } from "@/packages/ui"
import { Input } from "@/packages/ui/input"

export function FieldBasicDemo() {
  return (
    <Field className="max-w-md">
      <FieldLabel htmlFor="field-basic-name">项目名称</FieldLabel>
      <Input id="field-basic-name" placeholder="请输入项目名称" />
      <FieldDescription>名称将用于文档和通知展示。</FieldDescription>
    </Field>
  )
}

export default FieldBasicDemo
