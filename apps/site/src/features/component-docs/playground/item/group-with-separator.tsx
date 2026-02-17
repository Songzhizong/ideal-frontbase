import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from "@/packages/ui"

const DATA = [
  { title: "用户行为事件", desc: "统一上报页面浏览、点击、停留时长。" },
  { title: "支付回调事件", desc: "支付成功后写入审计日志并更新订单状态。" },
  { title: "告警通知事件", desc: "错误率超阈值后推送到值班群。" },
]

export function ItemGroupWithSeparatorDemo() {
  return (
    <ItemGroup className="max-w-lg rounded-md border border-border/50">
      {DATA.map((event, index) => (
        <div key={event.title}>
          <Item size="sm" className="rounded-none">
            <ItemContent>
              <ItemTitle>{event.title}</ItemTitle>
              <ItemDescription>{event.desc}</ItemDescription>
            </ItemContent>
          </Item>
          {index === DATA.length - 1 ? null : <ItemSeparator />}
        </div>
      ))}
    </ItemGroup>
  )
}

export default ItemGroupWithSeparatorDemo
