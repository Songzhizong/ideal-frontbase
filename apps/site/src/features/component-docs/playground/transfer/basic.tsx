import { useState } from "react"
import type { TransferItem } from "@/packages/ui"
import { Transfer } from "@/packages/ui"

const dataSource: TransferItem[] = [
  { key: "u1", title: "张三", description: "Owner" },
  { key: "u2", title: "李四", description: "Developer" },
  { key: "u3", title: "王五", description: "QA" },
  { key: "u4", title: "赵六", description: "DevOps" },
]

export function TransferBasicDemo() {
  const [targetKeys, setTargetKeys] = useState<string[]>(["u2"])

  return (
    <div className="w-full max-w-4xl space-y-2">
      <Transfer
        dataSource={dataSource}
        targetKeys={targetKeys}
        onChange={(nextTargetKeys) => setTargetKeys(nextTargetKeys)}
        sourceTitle="候选成员"
        targetTitle="已选成员"
      />
      <p className="text-xs text-muted-foreground">已选择：{targetKeys.join(", ") || "无"}</p>
    </div>
  )
}

export default TransferBasicDemo
