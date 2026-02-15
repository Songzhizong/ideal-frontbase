import { LoaderCircle } from "lucide-react"
import type * as React from "react"
import { Button } from "@/packages/ui"

interface StateGuideItem {
  key: string
  preview: React.ReactNode
  title: string
  description: string
}

const STATE_GUIDE_ITEMS: StateGuideItem[] = [
  {
    key: "default",
    preview: <Button size="sm">保存</Button>,
    title: "默认状态",
    description: "用于常规可交互场景。",
  },
  {
    key: "disabled",
    preview: (
      <Button size="sm" disabled>
        保存
      </Button>
    ),
    title: "禁用状态 (Disabled)",
    description: "依赖项未满足或权限不足时使用。",
  },
  {
    key: "loading",
    preview: (
      <Button size="sm" disabled leading={<LoaderCircle className="size-3.5 animate-spin" />}>
        保存
      </Button>
    ),
    title: "加载状态 (Loading)",
    description: "异步操作执行中，通过 disabled 防止重复提交。",
  },
  {
    key: "destructive",
    preview: (
      <Button size="sm" variant="destructive">
        重试
      </Button>
    ),
    title: "错误/危险 (Destructive)",
    description: "用于不可逆操作或强调错误修正。",
  },
]

export function ButtonMdStateGuideDemo() {
  return (
    <div className="w-full max-w-3xl rounded-xl border border-border bg-card p-1">
      <div className="divide-y divide-border">
        {STATE_GUIDE_ITEMS.map((item) => (
          <div key={item.key} className="flex items-center gap-4 p-4">
            <div className="w-24 shrink-0 text-center">{item.preview}</div>
            <div className="space-y-1">
              <p className="font-medium text-sm text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ButtonMdStateGuideDemo
