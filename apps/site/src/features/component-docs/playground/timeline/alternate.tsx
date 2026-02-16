import type { TimelineItem } from "@/packages/ui"
import { Timeline } from "@/packages/ui"

const items: TimelineItem[] = [
  { title: "需求评审", time: "周一 10:00", color: "info" },
  { title: "开发实现", time: "周二 14:00", color: "primary" },
  { title: "测试回归", time: "周三 16:00", color: "warning" },
  { title: "上线验收", time: "周四 11:00", color: "success" },
]

export function TimelineAlternateDemo() {
  return <Timeline items={items} mode="alternate" />
}

export default TimelineAlternateDemo
