import { useMemo, useState } from "react"
import { Button, Tour, type TourStep } from "@/packages/ui"

export function TourControlledDemo() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(0)
  const [finished, setFinished] = useState(false)

  const steps = useMemo<TourStep[]>(
    () => [
      {
        key: "project",
        target: "#tour-controlled-project",
        title: "项目列表",
        description: "展示你可访问的项目空间。",
      },
      {
        key: "environment",
        target: "#tour-controlled-env",
        title: "环境切换",
        description: "在此切换测试、预发与生产环境。",
      },
      {
        key: "release",
        target: "#tour-controlled-release",
        title: "发布按钮",
        description: "检查通过后可在这里触发发布。",
      },
    ],
    [],
  )

  return (
    <div className="w-full max-w-3xl space-y-4 rounded-lg border border-border/60 p-4">
      <div className="grid gap-2 sm:grid-cols-3">
        <div id="tour-controlled-project" className="rounded border border-border/60 p-3 text-sm">
          项目列表
        </div>
        <div id="tour-controlled-env" className="rounded border border-border/60 p-3 text-sm">
          环境切换
        </div>
        <div id="tour-controlled-release" className="rounded border border-border/60 p-3 text-sm">
          发布入口
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          onClick={() => {
            setFinished(false)
            setCurrent(0)
            setOpen(true)
          }}
        >
          从头开始
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setCurrent((prev) => Math.min(prev + 1, steps.length - 1))
          }}
        >
          外部下一步
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setCurrent((prev) => Math.max(prev - 1, 0))
          }}
        >
          外部上一步
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        当前步骤：{current + 1} / {steps.length}
        {finished ? "（已完成）" : ""}
      </p>
      <Tour
        steps={steps}
        open={open}
        current={current}
        onOpenChange={setOpen}
        onCurrentChange={setCurrent}
        showProgress={false}
        maskClosable={false}
        onFinish={() => {
          setFinished(true)
          setOpen(false)
        }}
      />
    </div>
  )
}

export default TourControlledDemo
