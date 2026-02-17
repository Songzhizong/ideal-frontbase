import { Label, RadioGroup, RadioGroupItem } from "@/packages/ui"

const PLANS = [
  { value: "starter", title: "Starter", desc: "适合个人项目" },
  { value: "team", title: "Team", desc: "适合小团队协作" },
  { value: "enterprise", title: "Enterprise", desc: "适合企业级部署" },
]

export function RadioGroupCardOptionsDemo() {
  return (
    <RadioGroup defaultValue="team" className="max-w-lg gap-2">
      {PLANS.map((plan) => (
        <Label
          key={plan.value}
          htmlFor={`plan-${plan.value}`}
          className="flex cursor-pointer items-start gap-3 rounded-md border border-border/50 p-3"
        >
          <RadioGroupItem id={`plan-${plan.value}`} value={plan.value} className="mt-0.5" />
          <div className="grid gap-1">
            <span className="text-sm font-medium text-foreground">{plan.title}</span>
            <span className="text-xs text-muted-foreground">{plan.desc}</span>
          </div>
        </Label>
      ))}
    </RadioGroup>
  )
}

export default RadioGroupCardOptionsDemo
