import { NativeSelect, NativeSelectOption } from "@/packages/ui"

export function NativeSelectStatesDemo() {
  return (
    <div className="grid w-full max-w-sm gap-3">
      <NativeSelect size="sm" defaultValue="manual" className="w-full">
        <NativeSelectOption value="manual">手动发布</NativeSelectOption>
        <NativeSelectOption value="auto">自动发布</NativeSelectOption>
      </NativeSelect>

      <NativeSelect disabled defaultValue="locked" className="w-full">
        <NativeSelectOption value="locked">当前环境已锁定</NativeSelectOption>
      </NativeSelect>

      <NativeSelect aria-invalid defaultValue="" className="w-full">
        <NativeSelectOption value="">请选择负责人</NativeSelectOption>
        <NativeSelectOption value="a">张三</NativeSelectOption>
      </NativeSelect>
    </div>
  )
}

export default NativeSelectStatesDemo
