import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@/packages/ui"

export function CardWithFooterDemo() {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>邀请成员</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Label htmlFor="card-invite-email">邮箱</Label>
        <Input id="card-invite-email" placeholder="name@company.com" />
      </CardContent>
      <CardFooter className="justify-end gap-2 border-t">
        <Button variant="outline">取消</Button>
        <Button>发送邀请</Button>
      </CardFooter>
    </Card>
  )
}

export default CardWithFooterDemo
