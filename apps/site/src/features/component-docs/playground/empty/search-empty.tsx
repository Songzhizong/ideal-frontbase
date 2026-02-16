import { SearchIcon } from "lucide-react"
import { BaseLink } from "@/packages/platform-router"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Input,
} from "@/packages/ui"

export function EmptySearchEmptyDemo() {
  return (
    <div className="w-full max-w-lg space-y-4">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value="billing-v2" readOnly className="pl-9" aria-label="搜索关键词" />
      </div>
      <Empty className="border border-border/60">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchIcon aria-hidden />
          </EmptyMedia>
          <EmptyTitle>未找到匹配结果</EmptyTitle>
          <EmptyDescription>
            请调整关键词，或前往 <BaseLink to="/components">组件列表</BaseLink> 浏览全部内容。
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <p className="text-xs text-muted-foreground">建议：减少筛选条件，或尝试英文组件名。</p>
        </EmptyContent>
      </Empty>
    </div>
  )
}

export default EmptySearchEmptyDemo
