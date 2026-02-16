import { CheckIcon } from "lucide-react"
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/packages/ui"

export function AvatarWithBadgeDemo() {
  return (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage src="https://i.pravatar.cc/120?img=8" alt="在线用户" />
        <AvatarFallback>ON</AvatarFallback>
        <AvatarBadge>
          <CheckIcon />
        </AvatarBadge>
      </Avatar>
      <Avatar size="lg">
        <AvatarImage src="https://i.pravatar.cc/120?img=33" alt="值班人员" />
        <AvatarFallback>DV</AvatarFallback>
        <AvatarBadge className="bg-success">
          <CheckIcon />
        </AvatarBadge>
      </Avatar>
    </div>
  )
}

export default AvatarWithBadgeDemo
