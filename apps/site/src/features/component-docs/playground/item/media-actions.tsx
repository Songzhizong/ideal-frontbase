import { BellIcon, MoreHorizontalIcon } from "lucide-react"
import {
  Button,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/packages/ui"

export function ItemMediaActionsDemo() {
  return (
    <Item variant="muted" size="sm" className="max-w-lg">
      <ItemMedia variant="icon">
        <BellIcon className="size-4" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>告警通知</ItemTitle>
        <ItemDescription>服务延迟超过阈值时，立即发送飞书通知。</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button size="sm" variant="outline">
          编辑
        </Button>
        <Button size="md" shape="square" variant="ghost" aria-label="更多操作">
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </ItemActions>
    </Item>
  )
}

export default ItemMediaActionsDemo
