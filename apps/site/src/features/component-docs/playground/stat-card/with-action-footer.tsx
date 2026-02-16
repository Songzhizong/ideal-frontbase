import { Button, StatCard } from "@/packages/ui"

export function StatCardWithActionFooterDemo() {
  return (
    <StatCard
      label="活跃用户"
      description="最近 24 小时去重 UV"
      value={9250}
      trend="up"
      trendValue="+8.1%"
      action={
        <Button size="xs" variant="ghost">
          详情
        </Button>
      }
      footer={<p className="text-xs text-muted-foreground">上次更新时间：10:28</p>}
    />
  )
}

export default StatCardWithActionFooterDemo
