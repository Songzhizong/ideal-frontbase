import { Result } from "@/packages/ui"

const statuses = [
  { label: "成功", value: "success" },
  { label: "错误", value: "error" },
  { label: "警告", value: "warning" },
  { label: "信息", value: "info" },
] as const

export function ResultStatusVariantsDemo() {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {statuses.map((item) => (
        <Result
          key={item.value}
          status={item.value}
          title={`状态：${item.label}`}
          subtitle="用于业务操作反馈的标准结果态。"
          className="min-h-56"
        />
      ))}
    </div>
  )
}

export default ResultStatusVariantsDemo
