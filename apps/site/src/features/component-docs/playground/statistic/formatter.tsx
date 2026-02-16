import { Statistic } from "@/packages/ui"

export function StatisticFormatterDemo() {
  return (
    <Statistic
      label="健康度评分"
      value={0.9321}
      formatter={(value) => {
        if (typeof value !== "number") {
          return "--"
        }
        return `${(value * 100).toFixed(1)}%`
      }}
      trend="up"
      trendValue="+1.4%"
    />
  )
}

export default StatisticFormatterDemo
