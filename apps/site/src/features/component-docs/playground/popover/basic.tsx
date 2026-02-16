import {
  Button,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/packages/ui"

export function PopoverBasicDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">查看说明</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>提示</PopoverTitle>
          <PopoverDescription>这个操作会影响当前筛选结果。</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  )
}

export default PopoverBasicDemo
