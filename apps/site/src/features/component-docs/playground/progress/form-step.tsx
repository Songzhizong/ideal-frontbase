import { Progress } from "@/packages/ui"

export function ProgressFormStepDemo() {
  const currentStep = 2
  const totalSteps = 5
  const percent = Math.round((currentStep / totalSteps) * 100)

  return (
    <div className="w-full max-w-md space-y-2">
      <p className="text-sm text-muted-foreground">
        当前步骤：第 {currentStep} / {totalSteps} 步
      </p>
      <Progress value={percent} aria-label={`步骤进度 ${percent}%`} />
    </div>
  )
}

export default ProgressFormStepDemo
