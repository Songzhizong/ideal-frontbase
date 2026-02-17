import { Search } from "lucide-react"
import { Input, Label } from "@/packages/ui"

export function InputSearchFieldDemo() {
  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="input-doc-search">关键词</Label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input id="input-doc-search" className="pl-9" placeholder="按名称搜索..." />
      </div>
    </div>
  )
}

export default InputSearchFieldDemo
