import { Button, ButtonGroup } from "@/packages/ui"

export function ButtonGroupVerticalToolbarDemo() {
  return (
    <ButtonGroup orientation="vertical" variant="outline" size="sm" className="w-32">
      <Button className="justify-start">向上插入</Button>
      <Button className="justify-start">复制一行</Button>
      <Button className="justify-start">删除行</Button>
    </ButtonGroup>
  )
}

export default ButtonGroupVerticalToolbarDemo
