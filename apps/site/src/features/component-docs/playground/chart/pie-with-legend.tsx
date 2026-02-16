import { Cell, Pie, PieChart } from "recharts"
import { ChartContainer, ChartLegend, ChartLegendContent } from "@/packages/ui"

const data = [
  { name: "成功", value: 68 },
  { name: "失败", value: 9 },
  { name: "重试", value: 23 },
]

const config = {
  成功: { label: "成功", color: "hsl(var(--success))" },
  失败: { label: "失败", color: "hsl(var(--error))" },
  重试: { label: "重试", color: "hsl(var(--warning))" },
}

export function ChartPieWithLegendDemo() {
  return (
    <ChartContainer config={config} className="h-72 w-full">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={46} outerRadius={78}>
          {data.map((item) => (
            <Cell key={item.name} fill={`var(--color-${item.name})`} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
      </PieChart>
    </ChartContainer>
  )
}

export default ChartPieWithLegendDemo
