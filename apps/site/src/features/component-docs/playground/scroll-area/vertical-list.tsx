import { ScrollArea } from "@/packages/ui"

const logs = Array.from(
  { length: 24 },
  (_, index) => `2026-02-16 10:${String(index).padStart(2, "0")} - 同步任务执行完成`,
)

export function ScrollAreaVerticalListDemo() {
  return (
    <ScrollArea
      className="h-56 w-full max-w-xl rounded-md border border-border/60"
      viewportClassName="p-3"
    >
      <ul className="space-y-1.5 text-xs text-muted-foreground">
        {logs.map((item) => (
          <li key={item} className="rounded bg-muted/40 px-2 py-1">
            {item}
          </li>
        ))}
      </ul>
    </ScrollArea>
  )
}

export default ScrollAreaVerticalListDemo
