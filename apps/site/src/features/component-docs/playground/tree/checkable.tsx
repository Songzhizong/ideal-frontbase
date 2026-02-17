import { useState } from "react"
import type { TreeDataNode, TreeKey } from "@/packages/ui"
import { Tree } from "@/packages/ui"

const treeData: TreeDataNode[] = [
  {
    key: "module-a",
    title: "模块 A",
    children: [
      { key: "a-read", title: "读取权限" },
      { key: "a-write", title: "写入权限" },
    ],
  },
  {
    key: "module-b",
    title: "模块 B",
    children: [
      { key: "b-read", title: "读取权限" },
      { key: "b-write", title: "写入权限" },
    ],
  },
]

export function TreeCheckableDemo() {
  const [checkedKeys, setCheckedKeys] = useState<TreeKey[]>(["a-read"])

  return (
    <div className="space-y-2">
      <Tree
        treeData={treeData}
        checkable
        checkedKeys={checkedKeys}
        onCheck={(keys) => {
          setCheckedKeys(keys)
        }}
      />
      <p className="text-xs text-muted-foreground">已勾选：{checkedKeys.join(", ") || "无"}</p>
    </div>
  )
}

export default TreeCheckableDemo
