import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/packages/ui"

export function InputGroupPriceEditorDemo() {
  return (
    <InputGroup className="max-w-md">
      <InputGroupAddon>
        <InputGroupText>CNY</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput defaultValue="199" inputMode="numeric" />
      <InputGroupAddon align="inline-end">
        <InputGroupText>/ 月</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  )
}

export default InputGroupPriceEditorDemo
