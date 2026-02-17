import { Button, ButtonGroup } from "@/packages/ui"

export function ButtonMdGroupDemo() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      <ButtonGroup variant="pure" color="accent" className="whitespace-nowrap">
        <Button>Button 1</Button>
        <Button>Button 2</Button>
        <Button>Button 3</Button>
      </ButtonGroup>
      <ButtonGroup orientation="vertical" variant="outline" color="warning" className="w-32">
        <Button>Button 1</Button>
        <Button>Button 2</Button>
        <Button>Button 3</Button>
      </ButtonGroup>
    </div>
  )
}

export default ButtonMdGroupDemo
