import {
  Button,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/packages/ui"

export function PopoverWithFormDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">快速编辑</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>重命名标签</PopoverTitle>
        </PopoverHeader>
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="popover-name">名称</Label>
            <Input id="popover-name" defaultValue="Release" />
          </div>
          <Button size="sm">保存</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default PopoverWithFormDemo
