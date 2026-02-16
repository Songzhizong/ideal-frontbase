import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/packages/ui"

const data = [
  { day: "Mon", latency: 42 },
  { day: "Tue", latency: 38 },
  { day: "Wed", latency: 47 },
  { day: "Thu", latency: 35 },
  { day: "Fri", latency: 40 },
]

const config = {
  latency: {
    label: "延迟(ms)",
    color: "hsl(var(--info))",
  },
}

export function ChartLineWithTooltipDemo() {
  return (
    <ChartContainer config={config} className="h-64 w-full">
      <LineChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={32} />
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <Line
          type="monotone"
          dataKey="latency"
          stroke="var(--color-latency)"
          strokeWidth={2}
          dot={{ fill: "var(--color-latency)" }}
        />
      </LineChart>
    </ChartContainer>
  )
}

export default ChartLineWithTooltipDemo
