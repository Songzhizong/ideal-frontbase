import { useMemo, useState } from "react"
import { Button, Tour, type TourStep } from "@/packages/ui"

export function TourWithCoverDemo() {
  const [open, setOpen] = useState(false)
  const steps = useMemo<TourStep[]>(
    () => [
      {
        key: "cover-step",
        target: "#tour-cover-card",
        title: "新能力速览",
        description: "引导卡可通过 `cover` 传入图像或业务预览组件。",
        placement: "right",
        cover: (
          <div className="h-24 w-full bg-gradient-to-r from-primary/15 via-info/25 to-success/20" />
        ),
      },
      {
        key: "action-step",
        target: "#tour-cover-action",
        title: "一键启用",
        description: "确认功能说明后，点击这里快速启用。",
        placement: "left",
      },
    ],
    [],
  )

  return (
    <div className="w-full max-w-3xl space-y-4 rounded-lg border border-border/60 p-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <div id="tour-cover-card" className="rounded border border-border/60 p-4 text-sm">
          功能卡片区域
        </div>
        <div id="tour-cover-action" className="rounded border border-border/60 p-4 text-sm">
          启用动作区域
        </div>
      </div>
      <Button
        variant="solid"
        color="secondary"
        onClick={() => {
          setOpen(true)
        }}
      >
        预览封面引导
      </Button>
      <Tour steps={steps} open={open} onOpenChange={setOpen} />
    </div>
  )
}

export default TourWithCoverDemo
