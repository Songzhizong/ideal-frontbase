import { Statistic } from "@/packages/ui"

export function StatisticPrefixSuffixDemo() {
  return (
    <Statistic
      label="云成本"
      value={12840.6}
      prefix="$"
      suffix="USD"
      precision={2}
      trend="down"
      trendValue="-3.1%"
    />
  )
}

export default StatisticPrefixSuffixDemo
