import { useState } from "react"
import type { TreeDataNode } from "@/packages/ui"
import { TreeSelect } from "@/packages/ui"

const treeData: TreeDataNode[] = [
  {
    key: "cn",
    title: "中国",
    children: [
      { key: "sh", title: "上海" },
      { key: "bj", title: "北京" },
      { key: "gz", title: "广州", disabled: true },
    ],
  },
  {
    key: "us",
    title: "美国",
    children: [
      { key: "la", title: "洛杉矶" },
      { key: "ny", title: "纽约" },
    ],
  },
]

export function TreeSelectSearchableDemo() {
  const [value, setValue] = useState<string[]>([])

  return (
    <div className="w-full max-w-lg space-y-2">
      <TreeSelect
        multiple
        searchable
        treeData={treeData}
        value={value}
        placeholder="请选择可部署区域"
        onChange={(nextValue) => setValue(Array.isArray(nextValue) ? nextValue : [])}
      />
      <p className="text-xs text-muted-foreground">选中：{value.join(", ") || "未选择"}</p>
    </div>
  )
}

export default TreeSelectSearchableDemo
