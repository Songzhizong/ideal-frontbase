import { useState } from "react"
import type { TreeDataNode, TreeSelectValue } from "@/packages/ui"
import { TreeSelect } from "@/packages/ui"

const treeData: TreeDataNode[] = [
  {
    key: "platform",
    title: "平台",
    children: [
      { key: "console", title: "控制台" },
      { key: "docs", title: "文档中心" },
    ],
  },
  {
    key: "business",
    title: "业务",
    children: [
      { key: "project", title: "项目管理" },
      { key: "billing", title: "计费中心" },
    ],
  },
]

export function TreeSelectBasicDemo() {
  const [value, setValue] = useState<TreeSelectValue>()

  return (
    <div className="w-full max-w-lg space-y-2">
      <TreeSelect treeData={treeData} value={value} onChange={(nextValue) => setValue(nextValue)} />
      <p className="text-xs text-muted-foreground">
        已选：{Array.isArray(value) ? value.join(", ") : (value ?? "未选择")}
      </p>
    </div>
  )
}

export default TreeSelectBasicDemo
