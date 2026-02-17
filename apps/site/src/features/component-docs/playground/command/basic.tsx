import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/packages/ui"

export function CommandBasicDemo() {
  return (
    <Command className="w-full max-w-xl rounded-lg border border-border/60">
      <CommandInput placeholder="输入关键词过滤命令..." />
      <CommandList>
        <CommandEmpty>未找到匹配命令</CommandEmpty>
        <CommandGroup heading="常用操作">
          <CommandItem>创建发布任务</CommandItem>
          <CommandItem>查看构建日志</CommandItem>
          <CommandItem>打开组件文档</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

export default CommandBasicDemo
