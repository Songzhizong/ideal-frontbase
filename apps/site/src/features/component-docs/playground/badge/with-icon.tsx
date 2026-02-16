import { CheckCircle2Icon, Clock3Icon, XCircleIcon } from "lucide-react"
import { Badge } from "@/packages/ui"

export function BadgeWithIconDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>
        <CheckCircle2Icon />
        已发布
      </Badge>
      <Badge variant="secondary">
        <Clock3Icon />
        待审核
      </Badge>
      <Badge variant="destructive">
        <XCircleIcon />
        已驳回
      </Badge>
    </div>
  )
}

export default BadgeWithIconDemo
