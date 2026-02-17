import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/packages/ui"

export function TooltipDelayProviderDemo() {
  return (
    <TooltipProvider delayDuration={500} skipDelayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">延迟提示</Button>
        </TooltipTrigger>
        <TooltipContent sideOffset={6}>延迟 500ms 后显示</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default TooltipDelayProviderDemo
