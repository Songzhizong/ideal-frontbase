import { Button, ButtonGroup } from "@/packages/ui"

export function ButtonGroupVariantAndSizeDemo() {
  return (
    <div className="flex flex-col items-start gap-4">
      <ButtonGroup color="secondary" variant="soft" size="sm">
        <Button>按周</Button>
        <Button>按月</Button>
        <Button>按年</Button>
      </ButtonGroup>

      <ButtonGroup color="destructive" variant="outline" size="lg" shadow="sm">
        <Button>拒绝</Button>
        <Button>忽略</Button>
        <Button>确认</Button>
      </ButtonGroup>
    </div>
  )
}

export default ButtonGroupVariantAndSizeDemo
