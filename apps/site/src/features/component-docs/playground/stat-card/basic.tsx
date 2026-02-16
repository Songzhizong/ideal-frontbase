import { StatCard } from "@/packages/ui"

export function StatCardBasicDemo() {
  return <StatCard label="今日请求量" value={12840} suffix="次" trend="up" trendValue="+12.4%" />
}

export default StatCardBasicDemo
