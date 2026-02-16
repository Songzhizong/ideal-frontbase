import { useState } from "react"
import type { TransferItem } from "@/packages/ui"
import { Transfer } from "@/packages/ui"

const dataSource: TransferItem[] = [
  { key: "service-auth", title: "认证服务", description: "auth-service" },
  { key: "service-order", title: "订单服务", description: "order-service" },
  { key: "service-billing", title: "计费服务", description: "billing-service" },
  { key: "service-monitor", title: "监控服务", description: "monitor-service", disabled: true },
]

export function TransferSearchableDemo() {
  const [targetKeys, setTargetKeys] = useState<string[]>([])

  return (
    <Transfer
      dataSource={dataSource}
      targetKeys={targetKeys}
      onChange={(nextTargetKeys) => setTargetKeys(nextTargetKeys)}
      searchable
      sourceTitle="可授权服务"
      targetTitle="已授权服务"
      sourceEmptyText="没有可授权项"
      targetEmptyText="尚未选择服务"
    />
  )
}

export default TransferSearchableDemo
