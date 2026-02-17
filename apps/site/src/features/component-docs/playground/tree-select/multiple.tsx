import { useState } from "react"
import type { TreeDataNode } from "@/packages/ui"
import { TreeSelect } from "@/packages/ui"

const treeData: TreeDataNode[] = [
  {
    key: "monitoring",
    title: "监控",
    children: [
      { key: "metrics", title: "指标" },
      { key: "alerts", title: "告警" },
      { key: "traces", title: "链路" },
    ],
  },
  {
    key: "storage",
    title: "存储",
    children: [
      { key: "mysql", title: "MySQL" },
      { key: "redis", title: "Redis" },
    ],
  },
]

export function TreeSelectMultipleDemo() {
  const [value, setValue] = useState<string[]>(["metrics"])

  return (
    <div className="w-full max-w-lg space-y-2">
      <TreeSelect
        multiple
        treeData={treeData}
        value={value}
        maxTagCount={1}
        onChange={(nextValue) => setValue(Array.isArray(nextValue) ? nextValue : [])}
      />
      <p className="text-xs text-muted-foreground">已选节点数：{value.length}</p>
    </div>
  )
}

export default TreeSelectMultipleDemo
