import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@/packages/ui"

const SIDES = ["top", "right", "bottom", "left"] as const

export function TooltipPositionsDemo() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {SIDES.map((side) => (
        <Tooltip key={side}>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm">
              {side}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={side}>{side} 提示</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}

export default TooltipPositionsDemo
