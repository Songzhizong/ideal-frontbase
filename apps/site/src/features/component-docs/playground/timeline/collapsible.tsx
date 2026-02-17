import type { TimelineItem } from "@/packages/ui"
import { Timeline } from "@/packages/ui"

const items: TimelineItem[] = Array.from({ length: 9 }, (_, index) => ({
  title: `变更步骤 ${index + 1}`,
  description: "执行自动化检查并记录结果。",
  time: `2026-02-16 1${Math.floor(index / 2)}:${(index % 2) * 30}`,
  color: index === 8 ? "success" : "default",
}))

export function TimelineCollapsibleDemo() {
  return (
    <Timeline
      items={items}
      collapsible
      collapseCount={4}
      expandText="展开更多步骤"
      collapseText="收起步骤"
    />
  )
}

export default TimelineCollapsibleDemo
