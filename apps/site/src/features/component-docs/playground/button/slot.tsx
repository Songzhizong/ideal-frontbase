import { Minus, Plus } from "lucide-react"
import { Button } from "@/packages/ui"

export function ButtonMdSlotDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button color="primary" leading={<Plus className="size-4" />}>
        leading
      </Button>
      <Button color="destructive" variant="outline" trailing={<Minus className="size-4" />}>
        trailing
      </Button>
      <Button
        color="success"
        variant="dashed"
        leading={<Plus className="size-4" />}
        trailing={<Minus className="size-4" />}
      >
        both
      </Button>
    </div>
  )
}

export default ButtonMdSlotDemo
