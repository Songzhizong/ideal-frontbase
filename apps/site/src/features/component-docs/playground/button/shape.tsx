import { Minus, Plus } from "lucide-react"
import { Button, ButtonIcon } from "@/packages/ui"

export function ButtonMdShapeDemo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button shape="rounded">rounded</Button>
      <ButtonIcon
        icon={<Minus className="size-4" />}
        variant="plain"
        color="destructive"
        shape="square"
      />
      <ButtonIcon
        icon={<Plus className="size-4" />}
        variant="outline"
        color="success"
        shape="circle"
      />
      <ButtonIcon
        icon={<Plus className="size-4" />}
        variant="dashed"
        color="warning"
        shape="square"
      />
      <ButtonIcon icon={<Minus className="size-4" />} shape="circle" />
    </div>
  )
}

export default ButtonMdShapeDemo
