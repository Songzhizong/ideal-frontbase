import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/packages/ui"
import { Input } from "@/packages/ui/input"

export function FieldGroupAndErrorDemo() {
  return (
    <FieldSet className="max-w-lg">
      <FieldLegend>发布配置</FieldLegend>
      <FieldGroup>
        <Field>
          <FieldDescription>镜像仓库</FieldDescription>
          <Input defaultValue="registry.example.com/app" />
        </Field>

        <Field data-invalid>
          <FieldDescription>命名空间</FieldDescription>
          <Input aria-invalid defaultValue="prod*namespace" />
          <FieldError errors={[{ message: "命名空间只能包含小写字母、数字和短横线" }]} />
        </Field>
      </FieldGroup>
    </FieldSet>
  )
}

export default FieldGroupAndErrorDemo
