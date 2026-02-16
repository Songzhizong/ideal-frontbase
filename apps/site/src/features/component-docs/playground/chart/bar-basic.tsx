import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartContainer } from "@/packages/ui"

const data = [
  { month: "1月", value: 120 },
  { month: "2月", value: 180 },
  { month: "3月", value: 160 },
  { month: "4月", value: 220 },
]

const config = {
  value: {
    label: "请求数",
    color: "hsl(var(--primary))",
  },
}

export function ChartBarBasicDemo() {
  return (
    <ChartContainer config={config} className="h-64 w-full">
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <Bar dataKey="value" fill="var(--color-value)" radius={6} />
      </BarChart>
    </ChartContainer>
  )
}

export default ChartBarBasicDemo
