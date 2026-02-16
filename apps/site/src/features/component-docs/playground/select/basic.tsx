import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui"

export function SelectBasicDemo() {
  return (
    <Select defaultValue="zh-CN">
      <SelectTrigger className="w-56">
        <SelectValue placeholder="请选择语言" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="zh-CN">简体中文</SelectItem>
        <SelectItem value="en-US">English</SelectItem>
        <SelectItem value="ja-JP">日本語</SelectItem>
      </SelectContent>
    </Select>
  )
}

export default SelectBasicDemo
