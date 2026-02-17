import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/packages/ui"

export function CardWithActionDemo() {
  return (
    <Card className="max-w-md">
      <CardHeader className="border-b">
        <CardTitle>部署记录</CardTitle>
        <CardDescription>最近一次发布成功，持续 2m 14s。</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline">
            查看详情
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        发布环境：production · 发布人：ops-bot
      </CardContent>
    </Card>
  )
}

export default CardWithActionDemo
