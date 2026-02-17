import { Anchor, type AnchorItem } from "@/packages/ui"

const ITEMS: AnchorItem[] = [
  {
    href: "#anchor-nested-getting-started",
    title: "快速开始",
    children: [
      { href: "#anchor-nested-install", title: "安装" },
      { href: "#anchor-nested-usage", title: "使用" },
    ],
  },
  { href: "#anchor-nested-best-practice", title: "最佳实践" },
]

export function AnchorNestedDemo() {
  return (
    <div className="grid max-w-4xl gap-4 md:grid-cols-[14rem_minmax(0,1fr)]">
      <Anchor items={ITEMS} />
      <div className="space-y-16">
        <section
          id="anchor-nested-getting-started"
          className="rounded-md border border-border/50 p-3"
        >
          <h4 className="mb-2 text-sm font-semibold">快速开始</h4>
          <p className="text-sm text-muted-foreground">先准备基础依赖。</p>
        </section>
        <section id="anchor-nested-install" className="rounded-md border border-border/50 p-3">
          <h4 className="mb-2 text-sm font-semibold">安装</h4>
          <p className="text-sm text-muted-foreground">使用 pnpm 安装所需包。</p>
        </section>
        <section id="anchor-nested-usage" className="rounded-md border border-border/50 p-3">
          <h4 className="mb-2 text-sm font-semibold">使用</h4>
          <p className="text-sm text-muted-foreground">将锚点导航放在内容旁侧。</p>
        </section>
        <section
          id="anchor-nested-best-practice"
          className="rounded-md border border-border/50 p-3"
        >
          <h4 className="mb-2 text-sm font-semibold">最佳实践</h4>
          <p className="text-sm text-muted-foreground">锚点标题建议与页面 TOC 保持一致。</p>
        </section>
      </div>
    </div>
  )
}

export default AnchorNestedDemo
