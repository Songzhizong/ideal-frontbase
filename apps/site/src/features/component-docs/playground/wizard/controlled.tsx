import { useState } from "react"
import { Wizard } from "@/packages/ui"

export function WizardControlledDemo() {
  const [step, setStep] = useState(0)

  return (
    <div className="grid gap-2">
      <Wizard
        currentStep={step}
        onStepChange={setStep}
        steps={[
          { id: "s1", title: "步骤一", content: <p className="text-sm">配置基础信息</p> },
          { id: "s2", title: "步骤二", content: <p className="text-sm">配置运行环境</p> },
          { id: "s3", title: "步骤三", content: <p className="text-sm">确认并发布</p> },
        ]}
      />
      <p className="text-xs text-muted-foreground">受控步骤：{step + 1}</p>
    </div>
  )
}

export default WizardControlledDemo
