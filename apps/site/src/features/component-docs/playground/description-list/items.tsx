import { DescriptionList } from "@/packages/ui"

const items = [
  { label: "应用名称", value: "ideal-site" },
  { label: "运行环境", value: "production" },
  { label: "部署区域", value: "ap-southeast-1" },
  { label: "最近发布时间", value: "2026-02-16 10:32" },
]

export function DescriptionListItemsDemo() {
  return <DescriptionList items={items} column={2} />
}

export default DescriptionListItemsDemo
