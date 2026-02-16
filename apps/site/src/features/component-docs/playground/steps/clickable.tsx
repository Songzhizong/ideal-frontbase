import { useState } from "react"
import { Steps } from "@/packages/ui"

export function StepsClickableDemo() {
  const [current, setCurrent] = useState(0)

  return (
    <div className="grid gap-2">
      <Steps
        current={current}
        onStepChange={setCurrent}
        items={[{ title: "基础设置" }, { title: "权限策略" }, { title: "完成发布" }]}
      />
      <p className="text-xs text-muted-foreground">当前步骤：{current + 1}</p>
    </div>
  )
}

export default StepsClickableDemo
