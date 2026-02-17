import { useRef } from "react"
import { Anchor, type AnchorItem } from "@/packages/ui"

const ITEMS: AnchorItem[] = [
  { href: "#anchor-box-1", title: "章节一" },
  { href: "#anchor-box-2", title: "章节二" },
  { href: "#anchor-box-3", title: "章节三" },
]

export function AnchorCustomContainerDemo() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  return (
    <div className="grid max-w-4xl gap-4 md:grid-cols-[14rem_minmax(0,1fr)]">
      <Anchor items={ITEMS} affix={false} target={() => containerRef.current} />
      <div
        ref={containerRef}
        className="h-72 space-y-8 overflow-y-auto rounded-md border border-border/50 p-3"
      >
        <section id="anchor-box-1" className="h-44 rounded-md border border-border/50 p-3 text-sm">
          章节一内容
        </section>
        <section id="anchor-box-2" className="h-44 rounded-md border border-border/50 p-3 text-sm">
          章节二内容
        </section>
        <section id="anchor-box-3" className="h-44 rounded-md border border-border/50 p-3 text-sm">
          章节三内容
        </section>
      </div>
    </div>
  )
}

export default AnchorCustomContainerDemo
