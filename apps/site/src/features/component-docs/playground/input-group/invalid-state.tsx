import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/packages/ui"

export function InputGroupInvalidStateDemo() {
  return (
    <div className="grid w-full max-w-md gap-2">
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>@</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput aria-invalid placeholder="请输入用户名" />
      </InputGroup>
      <p className="text-xs text-destructive">用户名已存在，请更换后重试。</p>
    </div>
  )
}

export default InputGroupInvalidStateDemo
