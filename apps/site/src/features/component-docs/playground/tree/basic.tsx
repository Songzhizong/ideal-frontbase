import { useState } from "react"
import type { TreeDataNode, TreeKey } from "@/packages/ui"
import { Tree } from "@/packages/ui"

const treeData: TreeDataNode[] = [
  {
    key: "project",
    title: "项目",
    children: [
      { key: "frontend", title: "前端" },
      { key: "backend", title: "后端" },
    ],
  },
  {
    key: "ops",
    title: "运维",
    children: [
      { key: "monitor", title: "监控" },
      { key: "alert", title: "告警" },
    ],
  },
]

export function TreeBasicDemo() {
  const [selectedKeys, setSelectedKeys] = useState<TreeKey[]>(["frontend"])

  return (
    <div className="space-y-2">
      <Tree
        treeData={treeData}
        selectedKeys={selectedKeys}
        onSelect={(keys) => setSelectedKeys(keys)}
      />
      <p className="text-xs text-muted-foreground">当前选中：{selectedKeys.join(", ") || "无"}</p>
    </div>
  )
}

export default TreeBasicDemo
