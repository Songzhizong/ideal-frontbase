import { Steps } from "@/packages/ui"

export function StepsStatusesDemo() {
  return (
    <Steps
      direction="vertical"
      items={[
        { title: "校验配置", status: "finish" },
        { title: "部署任务", status: "process" },
        { title: "回滚策略", status: "error", description: "请补充回滚脚本" },
      ]}
    />
  )
}

export default StepsStatusesDemo
