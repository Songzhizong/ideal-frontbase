import { BellIcon } from "lucide-react"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui"

export function SelectControlledDemo() {
  const [value, setValue] = useState("5m")

  return (
    <div className="grid w-full max-w-sm gap-2">
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger className="w-full" endAdornment={<BellIcon className="size-4" />}>
          <SelectValue placeholder="选择提醒周期" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5m">5 分钟</SelectItem>
          <SelectItem value="30m">30 分钟</SelectItem>
          <SelectItem value="1d">1 天</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">当前选择：{value}</p>
    </div>
  )
}

export default SelectControlledDemo
