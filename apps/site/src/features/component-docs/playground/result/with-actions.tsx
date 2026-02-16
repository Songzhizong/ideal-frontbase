import { Button, Result } from "@/packages/ui"

export function ResultWithActionsDemo() {
  return (
    <Result
      status="success"
      title="工单已创建"
      subtitle="你可以继续创建下一条，或前往工单列表查看详情。"
      extra={
        <>
          <Button size="sm">继续创建</Button>
          <Button size="sm" variant="outline">
            查看工单
          </Button>
        </>
      }
    />
  )
}

export default ResultWithActionsDemo
