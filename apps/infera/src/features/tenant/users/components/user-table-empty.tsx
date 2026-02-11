import { SearchX } from "lucide-react"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/packages/ui/empty"

export function UserTableEmpty() {
  return (
    <Empty className="border-0 px-2 py-16">
      <EmptyMedia variant="icon" className="bg-muted/30 rounded-full p-4 shadow-inner">
        <SearchX className="size-10 text-muted-foreground/40" />
      </EmptyMedia>
      <EmptyHeader className="mt-6">
        <EmptyTitle className="text-xl font-bold text-foreground/80">未找到匹配的用户</EmptyTitle>
        <EmptyDescription className="max-w-xs mx-auto text-muted-foreground/60 leading-relaxed">
          尝试使用不同的关键字或清除筛选条件，以获取更多结果。
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
