import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/ui"

export function CardBasicDemo() {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>本周概览</CardTitle>
        <CardDescription>关键指标按自然周统计。</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm text-muted-foreground">
        <p>新增用户：128</p>
        <p>活跃会话：1,024</p>
      </CardContent>
    </Card>
  )
}

export default CardBasicDemo
