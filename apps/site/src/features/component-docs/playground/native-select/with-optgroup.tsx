import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/packages/ui"

export function NativeSelectWithOptgroupDemo() {
  return (
    <NativeSelect defaultValue="hz" className="w-64">
      <NativeSelectOptGroup label="华东">
        <NativeSelectOption value="sh">上海</NativeSelectOption>
        <NativeSelectOption value="hz">杭州</NativeSelectOption>
      </NativeSelectOptGroup>
      <NativeSelectOptGroup label="华南">
        <NativeSelectOption value="gz">广州</NativeSelectOption>
        <NativeSelectOption value="sz">深圳</NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  )
}

export default NativeSelectWithOptgroupDemo
