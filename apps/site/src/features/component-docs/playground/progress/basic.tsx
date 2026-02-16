import { Progress } from "@/packages/ui"

export function ProgressBasicDemo() {
  return (
    <div className="w-full max-w-md space-y-2">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>发布进度</span>
        <span>45%</span>
      </div>
      <Progress value={45} aria-label="发布进度 45%" />
    </div>
  )
}

export default ProgressBasicDemo
