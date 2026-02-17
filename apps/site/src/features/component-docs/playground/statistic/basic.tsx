import { Statistic } from "@/packages/ui"

export function StatisticBasicDemo() {
  return <Statistic label="QPS" value={3240} trend="up" trendValue="较昨日 +5.2%" />
}

export default StatisticBasicDemo
