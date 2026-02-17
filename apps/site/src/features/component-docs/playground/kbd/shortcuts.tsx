import { Kbd, KbdGroup } from "@/packages/ui"

export function KbdShortcutsDemo() {
  return (
    <div className="grid gap-2 text-sm">
      <p className="flex items-center gap-2">
        全局搜索
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </p>
      <p className="flex items-center gap-2">
        提交表单
        <KbdGroup>
          <Kbd>Ctrl</Kbd>
          <Kbd>Enter</Kbd>
        </KbdGroup>
      </p>
    </div>
  )
}

export default KbdShortcutsDemo
