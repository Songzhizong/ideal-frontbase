import { Anchor, type AnchorItem } from "@/packages/ui"

const ITEMS: AnchorItem[] = [
  { href: "#anchor-basic-overview", title: "概览" },
  { href: "#anchor-basic-api", title: "API" },
  { href: "#anchor-basic-faq", title: "FAQ" },
]

export function AnchorBasicDemo() {
  return (
    <div className="grid max-w-4xl gap-4 md:grid-cols-[14rem_minmax(0,1fr)]">
      <Anchor items={ITEMS} />
      <div className="space-y-16">
        <section id="anchor-basic-overview" className="rounded-md border border-border/50 p-3">
          <h4 className="mb-2 text-sm font-semibold">概览</h4>
          <p className="text-sm text-muted-foreground">Anchor 用于跟随滚动高亮章节。</p>
        </section>
        <section id="anchor-basic-api" className="rounded-md border border-border/50 p-3">
          <h4 className="mb-2 text-sm font-semibold">API</h4>
          <p className="text-sm text-muted-foreground">支持嵌套项、偏移量与自定义滚动容器。</p>
        </section>
        <section id="anchor-basic-faq" className="rounded-md border border-border/50 p-3">
          <h4 className="mb-2 text-sm font-semibold">FAQ</h4>
          <p className="text-sm text-muted-foreground">建议给锚点 section 设置稳定 id。</p>
        </section>
      </div>
    </div>
  )
}

export default AnchorBasicDemo
