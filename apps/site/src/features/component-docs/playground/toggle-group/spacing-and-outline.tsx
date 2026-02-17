import { ToggleGroup, ToggleGroupItem } from "@/packages/ui"

export function ToggleGroupSpacingAndOutlineDemo() {
  return (
    <div className="space-y-3">
      <ToggleGroup
        type="single"
        variant="outline"
        spacing={0}
        defaultValue="all"
        aria-label="状态筛选"
      >
        <ToggleGroupItem value="all">全部</ToggleGroupItem>
        <ToggleGroupItem value="active">启用</ToggleGroupItem>
        <ToggleGroupItem value="disabled">停用</ToggleGroupItem>
      </ToggleGroup>

      <ToggleGroup
        type="single"
        variant="outline"
        spacing={1}
        defaultValue="week"
        aria-label="时间维度"
      >
        <ToggleGroupItem value="day">按天</ToggleGroupItem>
        <ToggleGroupItem value="week">按周</ToggleGroupItem>
        <ToggleGroupItem value="month">按月</ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}

export default ToggleGroupSpacingAndOutlineDemo
