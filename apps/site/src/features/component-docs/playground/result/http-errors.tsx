import { Button, Result } from "@/packages/ui"

export function ResultHttpErrorsDemo() {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <Result
        status="403"
        title="403 - 无权限访问"
        subtitle="当前账号未开通此资源权限。"
        extra={<Button size="sm">申请权限</Button>}
      />
      <Result
        status="404"
        title="404 - 页面不存在"
        subtitle="链接可能失效，或页面已被迁移。"
        extra={
          <Button size="sm" variant="outline">
            返回首页
          </Button>
        }
      />
      <Result
        status="500"
        title="500 - 服务异常"
        subtitle="服务暂时不可用，请稍后重试。"
        extra={<Button size="sm">刷新重试</Button>}
      />
    </div>
  )
}

export default ResultHttpErrorsDemo
