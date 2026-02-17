import { NativeSelect, NativeSelectOption } from "@/packages/ui"

export function NativeSelectBasicDemo() {
  return (
    <NativeSelect defaultValue="pending" className="w-56">
      <NativeSelectOption value="pending">待处理</NativeSelectOption>
      <NativeSelectOption value="running">进行中</NativeSelectOption>
      <NativeSelectOption value="done">已完成</NativeSelectOption>
    </NativeSelect>
  )
}

export default NativeSelectBasicDemo
