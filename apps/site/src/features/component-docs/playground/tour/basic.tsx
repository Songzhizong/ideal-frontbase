import { useMemo, useState } from "react"
import { Button, Tour, type TourStep } from "@/packages/ui"

export function TourBasicDemo() {
  const [open, setOpen] = useState(false)
  const steps = useMemo<TourStep[]>(
    () => [
      {
        key: "menu",
        target: "#tour-basic-menu",
        title: "主导航",
        description: "从这里可快速切换到首页、设计与组件文档。",
        placement: "bottom",
      },
      {
        key: "search",
        target: "#tour-basic-search",
        title: "全局搜索",
        description: "支持按组件名与关键字检索文档。",
        placement: "bottom",
      },
      {
        key: "profile",
        target: "#tour-basic-profile",
        title: "账号入口",
        description: "查看通知、切换组织与个人设置。",
        placement: "left",
      },
    ],
    [],
  )

  return (
    <div className="w-full max-w-3xl space-y-4 rounded-lg border border-border/60 p-4">
      <div className="flex items-center justify-between gap-2 rounded-md bg-muted/50 p-3">
        <div
          id="tour-basic-menu"
          className="rounded border border-border/60 bg-background px-3 py-1 text-sm"
        >
          导航菜单
        </div>
        <div
          id="tour-basic-search"
          className="rounded border border-border/60 bg-background px-3 py-1 text-sm"
        >
          搜索框
        </div>
        <div
          id="tour-basic-profile"
          className="rounded border border-border/60 bg-background px-3 py-1 text-sm"
        >
          账号中心
        </div>
      </div>
      <Button
        onClick={() => {
          setOpen(true)
        }}
      >
        开始引导
      </Button>
      <Tour steps={steps} open={open} onOpenChange={setOpen} />
    </div>
  )
}

export default TourBasicDemo
