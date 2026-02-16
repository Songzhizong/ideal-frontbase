import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/packages/ui"

export function HoverCardBasicDemo() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button type="button" className="text-sm text-primary underline underline-offset-4">
          @frontend-team
        </button>
      </HoverCardTrigger>
      <HoverCardContent>
        <p className="text-sm font-medium">前端团队</p>
        <p className="mt-1 text-sm text-muted-foreground">负责设计系统与 Web 应用开发。</p>
      </HoverCardContent>
    </HoverCard>
  )
}

export default HoverCardBasicDemo
