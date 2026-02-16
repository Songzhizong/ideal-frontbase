import { Pause, SkipBack, SkipForward } from "lucide-react"
import { ButtonIcon } from "@/packages/ui"

export function ButtonMdIconDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <ButtonIcon icon={<SkipBack className="size-4" />} />
      <ButtonIcon icon={<SkipForward className="size-4" />} />
      <ButtonIcon icon={<Pause className="size-4" />} />
    </div>
  )
}

export default ButtonMdIconDemo
