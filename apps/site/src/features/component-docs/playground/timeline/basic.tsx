import type { TimelineItem } from "@/packages/ui"
import { Timeline } from "@/packages/ui"

const items: TimelineItem[] = [
  {
    title: "创建发布任务",
    description: "配置发布版本与目标环境。",
    time: "2026-02-16 09:20",
    color: "info",
  },
  {
    title: "灰度发布",
    description: "10% 流量验证中。",
    time: "2026-02-16 09:45",
    color: "warning",
  },
  {
    title: "全量发布完成",
    description: "服务状态恢复稳定。",
    time: "2026-02-16 10:10",
    color: "success",
  },
]

export function TimelineBasicDemo() {
  return <Timeline items={items} />
}

export default TimelineBasicDemo
