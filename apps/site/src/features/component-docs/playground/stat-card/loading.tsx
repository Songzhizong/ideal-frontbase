import { StatCard } from "@/packages/ui"

export function StatCardLoadingDemo() {
  return <StatCard label="实时消费" value={0} loading description="正在拉取监控数据..." />
}

export default StatCardLoadingDemo
