import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/packages/ui"

export function DropdownMenuDestructiveSubmenuDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">更多</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>导出数据</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>危险操作</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem variant="destructive">删除记录</DropdownMenuItem>
            <DropdownMenuItem variant="destructive">永久禁用</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DropdownMenuDestructiveSubmenuDemo
