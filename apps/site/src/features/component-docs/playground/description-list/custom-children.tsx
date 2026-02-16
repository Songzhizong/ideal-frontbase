import { Badge, DescriptionItem, DescriptionList } from "@/packages/ui"

export function DescriptionListCustomChildrenDemo() {
  return (
    <DescriptionList column={2} bordered>
      <DescriptionItem label="服务状态" value={<Badge color="success">运行中</Badge>} />
      <DescriptionItem label="实例规格" value="4C8G" />
      <DescriptionItem label="访问地址" span={2}>
        https://site.ideal-frontbase.dev
      </DescriptionItem>
      <DescriptionItem label="备注" value="" empty="暂无备注" />
    </DescriptionList>
  )
}

export default DescriptionListCustomChildrenDemo
