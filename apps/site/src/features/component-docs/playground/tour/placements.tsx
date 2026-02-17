import { useMemo, useState } from "react"
import { Button, Tour, type TourStep } from "@/packages/ui"

export function TourPlacementsDemo() {
  const [open, setOpen] = useState(false)
  const steps = useMemo<TourStep[]>(
    () => [
      {
        key: "top",
        target: "#tour-place-top",
        title: "Top 定位",
        description: "当目标位于下方可视区时，优先尝试放置在顶部。",
        placement: "top",
      },
      {
        key: "right",
        target: "#tour-place-right",
        title: "Right 定位",
        description: "适合目标左侧留白较多的场景。",
        placement: "right",
      },
      {
        key: "bottom",
        target: "#tour-place-bottom",
        title: "Bottom 定位",
        description: "最常用的引导放置方向。",
        placement: "bottom",
      },
      {
        key: "left",
        target: "#tour-place-left",
        title: "Left 定位",
        description: "适合目标右侧留白充足的布局。",
        placement: "left",
      },
      {
        key: "center",
        target: "#tour-place-center",
        title: "Center 定位",
        description: "用于跨区域说明，和具体目标弱绑定。",
        placement: "center",
      },
    ],
    [],
  )

  return (
    <div className="w-full max-w-3xl space-y-4 rounded-lg border border-border/60 p-4">
      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        <div id="tour-place-top" className="rounded border border-border/60 p-3">
          顶部目标
        </div>
        <div id="tour-place-center" className="rounded border border-border/60 p-3">
          中心目标
        </div>
        <div id="tour-place-right" className="rounded border border-border/60 p-3">
          右侧目标
        </div>
        <div className="rounded border border-transparent p-3" />
        <div id="tour-place-bottom" className="rounded border border-border/60 p-3">
          底部目标
        </div>
        <div id="tour-place-left" className="rounded border border-border/60 p-3">
          左侧目标
        </div>
      </div>
      <Button
        variant="outline"
        onClick={() => {
          setOpen(true)
        }}
      >
        查看定位差异
      </Button>
      <Tour steps={steps} open={open} onOpenChange={setOpen} />
    </div>
  )
}

export default TourPlacementsDemo
