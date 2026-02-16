import { useState } from "react"
import type { CascaderMultiValue, CascaderOption } from "@/packages/ui"
import { Cascader } from "@/packages/ui"

const options: CascaderOption[] = [
  {
    value: "cloud",
    label: "云资源",
    children: [
      {
        value: "compute",
        label: "计算",
        children: [
          { value: "vm", label: "虚拟机" },
          { value: "k8s", label: "Kubernetes" },
        ],
      },
      {
        value: "storage",
        label: "存储",
        children: [
          { value: "object", label: "对象存储" },
          { value: "block", label: "块存储" },
        ],
      },
    ],
  },
]

export function CascaderMultipleDemo() {
  const [value, setValue] = useState<CascaderMultiValue>([])

  return (
    <div className="w-full max-w-lg space-y-2">
      <Cascader
        multiple
        options={options}
        value={value}
        maxTagCount={1}
        onChange={(nextValue: CascaderMultiValue) => setValue(nextValue)}
      />
      <p className="text-xs text-muted-foreground">已选路径数：{value.length}</p>
    </div>
  )
}

export default CascaderMultipleDemo
