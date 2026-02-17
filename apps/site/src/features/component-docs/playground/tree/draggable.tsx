import { useState } from "react"
import type { TreeDataNode } from "@/packages/ui"
import { Tree } from "@/packages/ui"

const initialTreeData: TreeDataNode[] = [
  {
    key: "root-1",
    title: "目录 A",
    children: [
      { key: "a-1", title: "页面 1" },
      { key: "a-2", title: "页面 2" },
    ],
  },
  {
    key: "root-2",
    title: "目录 B",
    children: [{ key: "b-1", title: "页面 3" }],
  },
]

export function TreeDraggableDemo() {
  const [treeData, setTreeData] = useState(initialTreeData)
  const [tip, setTip] = useState("拖拽节点可调整结构")

  return (
    <div className="space-y-2">
      <Tree
        treeData={treeData}
        draggable
        onDrop={(info) => {
          setTreeData(info.treeData)
          setTip(`${info.dragKey} -> ${info.dropKey} (${info.dropPosition})`)
        }}
      />
      <p className="text-xs text-muted-foreground">最近拖拽：{tip}</p>
    </div>
  )
}

export default TreeDraggableDemo
