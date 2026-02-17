import { useState } from "react"
import type { TransferItem } from "@/packages/ui"
import { Tag, Transfer } from "@/packages/ui"

const dataSource: TransferItem[] = [
  { key: "perm-read", title: "读取日志", description: "read:logs" },
  { key: "perm-write", title: "写入配置", description: "write:config" },
  { key: "perm-release", title: "发布应用", description: "release:app" },
]

export function TransferCustomRenderDemo() {
  const [targetKeys, setTargetKeys] = useState<string[]>(["perm-read"])

  return (
    <Transfer
      dataSource={dataSource}
      targetKeys={targetKeys}
      onChange={(nextTargetKeys) => setTargetKeys(nextTargetKeys)}
      sourceTitle="可分配权限"
      targetTitle="已分配权限"
      renderItem={(item) => (
        <div className="flex min-w-0 items-center justify-between gap-2">
          <span className="truncate">{item.title}</span>
          {item.description ? <Tag variant="outline">{item.description}</Tag> : null}
        </div>
      )}
    />
  )
}

export default TransferCustomRenderDemo
