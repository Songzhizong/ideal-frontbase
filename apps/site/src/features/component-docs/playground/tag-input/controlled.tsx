import { useState } from "react"
import { TagInput } from "@/packages/ui"

export function TagInputControlledDemo() {
  const [tags, setTags] = useState<string[]>(["design-system"])

  return (
    <div className="grid w-full max-w-lg gap-2">
      <TagInput value={tags} onChange={setTags} placeholder="输入后按回车创建标签" />
      <p className="text-xs text-muted-foreground">标签数量：{tags.length}</p>
    </div>
  )
}

export default TagInputControlledDemo
