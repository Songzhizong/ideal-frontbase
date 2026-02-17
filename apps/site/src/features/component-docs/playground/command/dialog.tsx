import { SearchIcon } from "lucide-react"
import { useState } from "react"
import {
  Button,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/packages/ui"

export function CommandDialogDemo() {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        onClick={() => {
          setOpen(true)
        }}
      >
        <SearchIcon aria-hidden className="size-4" />
        打开命令面板
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="命令中心"
        description="搜索可执行动作"
      >
        <CommandInput placeholder="输入命令名..." />
        <CommandList>
          <CommandEmpty>无匹配项</CommandEmpty>
          <CommandGroup heading="导航">
            <CommandItem onSelect={() => setOpen(false)}>
              跳转到组件总览
              <CommandShortcut>⌘K</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => setOpen(false)}>
              打开设计指南
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}

export default CommandDialogDemo
