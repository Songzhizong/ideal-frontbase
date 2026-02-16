import { useState } from "react"
import type { CascaderOption, CascaderSingleValue } from "@/packages/ui"
import { Cascader } from "@/packages/ui"

const options: CascaderOption[] = [
  {
    value: "frontend",
    label: "前端",
    children: [
      {
        value: "site",
        label: "站点",
        children: [
          { value: "docs", label: "组件文档" },
          { value: "design", label: "设计系统" },
        ],
      },
      {
        value: "app",
        label: "业务应用",
        children: [
          { value: "nexus", label: "Nexus" },
          { value: "infera", label: "Infera" },
        ],
      },
    ],
  },
]

export function CascaderBasicDemo() {
  const [value, setValue] = useState<CascaderSingleValue | undefined>()

  return (
    <div className="w-full max-w-lg space-y-2">
      <Cascader
        options={options}
        value={value}
        onChange={(nextValue: CascaderSingleValue | undefined) => setValue(nextValue)}
      />
      <p className="text-xs text-muted-foreground">已选：{value?.join(" / ") ?? "未选择"}</p>
    </div>
  )
}

export default CascaderBasicDemo
