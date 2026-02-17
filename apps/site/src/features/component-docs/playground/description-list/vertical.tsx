import { DescriptionList } from "@/packages/ui"

const items = [
  { label: "数据库", value: "MySQL 8.0" },
  { label: "缓存", value: "Redis 7" },
  { label: "消息队列", value: "Kafka" },
]

export function DescriptionListVerticalDemo() {
  return <DescriptionList items={items} orientation="vertical" bordered column={3} />
}

export default DescriptionListVerticalDemo
