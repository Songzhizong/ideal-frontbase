import { ChevronRightIcon } from "lucide-react"
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/packages/ui"

export function ItemBasicDemo() {
  return (
    <Item variant="outline" className="max-w-lg">
      <ItemContent>
        <ItemTitle>支付方式</ItemTitle>
        <ItemDescription>默认使用企业账户余额进行扣款。</ItemDescription>
      </ItemContent>
      <ItemActions>
        <ChevronRightIcon className="size-4 text-muted-foreground" />
      </ItemActions>
    </Item>
  )
}

export default ItemBasicDemo
