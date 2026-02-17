import { Input, Label, Wizard } from "@/packages/ui"

export function WizardBasicDemo() {
  return (
    <Wizard
      className="w-full max-w-4xl"
      steps={[
        {
          id: "project",
          title: "项目",
          content: (
            <div className="grid gap-2">
              <Label htmlFor="wizard-basic-project">项目名称</Label>
              <Input id="wizard-basic-project" placeholder="请输入项目名称" />
            </div>
          ),
        },
        {
          id: "owner",
          title: "负责人",
          content: (
            <div className="grid gap-2">
              <Label htmlFor="wizard-basic-owner">负责人</Label>
              <Input id="wizard-basic-owner" placeholder="请输入负责人" />
            </div>
          ),
        },
      ]}
    />
  )
}

export default WizardBasicDemo
