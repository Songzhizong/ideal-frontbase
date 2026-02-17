import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/packages/ui"

export function HoverCardProfileDemo() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button type="button" className="inline-flex items-center gap-2 text-sm">
          <Avatar size="sm">
            <AvatarImage src="https://i.pravatar.cc/120?img=5" alt="Alice" />
            <AvatarFallback>AL</AvatarFallback>
          </Avatar>
          Alice
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-72">
        <p className="text-sm font-medium">Alice Chen</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Staff Engineer · 主要负责稳定性与性能优化。
        </p>
      </HoverCardContent>
    </HoverCard>
  )
}

export default HoverCardProfileDemo
