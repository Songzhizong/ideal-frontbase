import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/packages/ui"

export function HoverCardDelaysDemo() {
  return (
    <HoverCard openDelay={500} closeDelay={150}>
      <HoverCardTrigger asChild>
        <button type="button" className="text-sm text-primary underline underline-offset-4">
          悬停 500ms 查看详情
        </button>
      </HoverCardTrigger>
      <HoverCardContent>
        <p className="text-sm text-muted-foreground">通过 openDelay / closeDelay 控制触发节奏。</p>
      </HoverCardContent>
    </HoverCard>
  )
}

export default HoverCardDelaysDemo
