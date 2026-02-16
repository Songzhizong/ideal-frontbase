import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/packages/ui"

export function SelectGroupedDemo() {
  return (
    <Select>
      <SelectTrigger className="w-64">
        <SelectValue placeholder="选择部署环境" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>测试环境</SelectLabel>
          <SelectItem value="dev">Development</SelectItem>
          <SelectItem value="test">Testing</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>生产环境</SelectLabel>
          <SelectItem value="staging">Staging</SelectItem>
          <SelectItem value="prod">Production</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default SelectGroupedDemo
