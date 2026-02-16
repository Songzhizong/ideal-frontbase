import { Button, ButtonGroup } from "@/packages/ui"

export function ButtonGroupBasicDemo() {
  return (
    <ButtonGroup>
      <Button variant="outline">保存草稿</Button>
      <Button>发布</Button>
      <Button variant="outline">更多操作</Button>
    </ButtonGroup>
  )
}

export default ButtonGroupBasicDemo
