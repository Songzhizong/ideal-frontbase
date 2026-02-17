import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react"
import { useState } from "react"
import { ToggleGroup, ToggleGroupItem } from "@/packages/ui"

export function ToggleGroupMultipleDemo() {
  const [value, setValue] = useState<string[]>(["bold"])

  return (
    <div className="space-y-2">
      <ToggleGroup type="multiple" value={value} onValueChange={setValue} aria-label="文本样式">
        <ToggleGroupItem value="bold" aria-label="粗体">
          <BoldIcon aria-hidden />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="斜体">
          <ItalicIcon aria-hidden />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="下划线">
          <UnderlineIcon aria-hidden />
        </ToggleGroupItem>
      </ToggleGroup>
      <p className="text-xs text-muted-foreground">当前值：{value.join(", ") || "(空)"}</p>
    </div>
  )
}

export default ToggleGroupMultipleDemo
