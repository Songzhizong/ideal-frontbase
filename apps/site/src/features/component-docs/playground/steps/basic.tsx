import { Steps } from "@/packages/ui"

export function StepsBasicDemo() {
  return (
    <Steps
      current={1}
      items={[
        { title: "创建项目", description: "初始化基础信息" },
        { title: "配置环境", description: "绑定测试与生产环境" },
        { title: "完成", description: "开始使用" },
      ]}
    />
  )
}

export default StepsBasicDemo
