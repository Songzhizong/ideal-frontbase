import { Progress } from "@/packages/ui"

const tasks = [
  { name: "静态资源上传", value: 100 },
  { name: "镜像构建", value: 68 },
  { name: "发布校验", value: 22 },
]

export function ProgressMultipleTasksDemo() {
  return (
    <div className="w-full max-w-md space-y-4">
      {tasks.map((task) => (
        <div key={task.name} className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{task.name}</span>
            <span>{task.value}%</span>
          </div>
          <Progress value={task.value} aria-label={`${task.name} ${task.value}%`} />
        </div>
      ))}
    </div>
  )
}

export default ProgressMultipleTasksDemo
