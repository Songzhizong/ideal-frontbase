import { useState } from "react"
import { Input, Label, Wizard } from "@/packages/ui"

export function WizardWithValidationDemo() {
  const [name, setName] = useState("")

  return (
    <Wizard
      steps={[
        {
          id: "name",
          title: "基础信息",
          validation: () => name.trim().length >= 2,
          content: (
            <div className="grid gap-2">
              <Label htmlFor="wizard-validate-name">应用名称（至少 2 个字符）</Label>
              <Input
                id="wizard-validate-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="请输入应用名称"
              />
            </div>
          ),
        },
        {
          id: "done",
          title: "完成",
          content: <p className="text-sm text-muted-foreground">基础信息校验通过。</p>,
        },
      ]}
      onFinish={() => Promise.resolve()}
    />
  )
}

export default WizardWithValidationDemo
