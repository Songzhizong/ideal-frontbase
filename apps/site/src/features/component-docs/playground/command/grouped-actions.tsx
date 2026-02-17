import { useState } from "react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/packages/ui"

export function CommandGroupedActionsDemo() {
  const [selected, setSelected] = useState("无")

  return (
    <div className="w-full max-w-xl space-y-2">
      <Command className="rounded-lg border border-border/60">
        <CommandInput placeholder="搜索动作..." />
        <CommandList>
          <CommandEmpty>没有找到可执行动作</CommandEmpty>
          <CommandGroup heading="项目">
            <CommandItem onSelect={() => setSelected("创建项目")}>创建项目</CommandItem>
            <CommandItem onSelect={() => setSelected("克隆项目")}>克隆项目</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="系统">
            <CommandItem onSelect={() => setSelected("打开偏好设置")}>打开偏好设置</CommandItem>
            <CommandItem onSelect={() => setSelected("切换主题")}>切换主题</CommandItem>
            <CommandItem onSelect={() => setSelected("清理缓存")}>清理缓存</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="快捷键">
            <CommandItem onSelect={() => setSelected("保存")}>
              保存 <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => setSelected("提交")}>
              提交 <CommandShortcut>⌘↵</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
      <p className="text-xs text-muted-foreground">最近执行：{selected}</p>
    </div>
  )
}

export default CommandGroupedActionsDemo
