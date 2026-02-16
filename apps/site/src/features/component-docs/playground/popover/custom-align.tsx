import { Button, Popover, PopoverContent, PopoverTrigger } from "@/packages/ui"

export function PopoverCustomAlignDemo() {
  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">左对齐</Button>
        </PopoverTrigger>
        <PopoverContent align="start">start 对齐内容</PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">右对齐</Button>
        </PopoverTrigger>
        <PopoverContent align="end">end 对齐内容</PopoverContent>
      </Popover>
    </div>
  )
}

export default PopoverCustomAlignDemo
