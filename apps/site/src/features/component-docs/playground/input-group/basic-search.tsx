import { SearchIcon } from "lucide-react"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/packages/ui"

export function InputGroupBasicSearchDemo() {
  return (
    <InputGroup className="max-w-md">
      <InputGroupAddon>
        <SearchIcon className="size-4" />
      </InputGroupAddon>
      <InputGroupInput placeholder="按名称搜索" />
      <InputGroupButton>搜索</InputGroupButton>
    </InputGroup>
  )
}

export default InputGroupBasicSearchDemo
