import { Button, ButtonGroup } from "@/packages/ui"

export function ButtonGroupDisabledScopeDemo() {
  return (
    <ButtonGroup disabled variant="outline">
      <Button>新增</Button>
      <Button>编辑</Button>
      <Button>删除</Button>
    </ButtonGroup>
  )
}

export default ButtonGroupDisabledScopeDemo
