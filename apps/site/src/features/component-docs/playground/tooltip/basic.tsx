import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@/packages/ui"

export function TooltipBasicDemo() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">悬停查看</Button>
      </TooltipTrigger>
      <TooltipContent>这是一个基础提示</TooltipContent>
    </Tooltip>
  )
}

export default TooltipBasicDemo
