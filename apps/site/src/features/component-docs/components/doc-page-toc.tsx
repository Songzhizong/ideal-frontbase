import { useEffect, useMemo, useState } from "react"
import type { MarkdownHeading } from "@/features/component-docs/components/markdown-heading"
import { cn } from "@/packages/ui-utils"

interface DocPageTocProps {
  headings: readonly MarkdownHeading[]
  className?: string | undefined
}

function findScrollContainer() {
  return document.querySelector<HTMLElement>("[data-component-doc-scroll-container='true']")
}

function getHeadingElement(id: string) {
  return document.getElementById(id)
}

function resolveActiveHeadingId(headings: readonly MarkdownHeading[]) {
  const container = findScrollContainer()
  const containerTop = container?.getBoundingClientRect().top ?? 0
  let activeId = headings[0]?.id ?? ""

  for (const heading of headings) {
    const element = getHeadingElement(heading.id)

    if (!element) {
      continue
    }

    const offsetTop = element.getBoundingClientRect().top - containerTop

    if (offsetTop <= 92) {
      activeId = heading.id
      continue
    }

    break
  }

  return activeId
}

export function DocPageToc({ headings, className }: DocPageTocProps) {
  const visibleHeadings = useMemo(
    () => headings.filter((heading) => heading.level === 2 || heading.level === 3),
    [headings],
  )
  const compactHeadings = useMemo(() => {
    // 章节较多时仅显示二级标题，提升一屏可见率
    if (visibleHeadings.length > 20) {
      return visibleHeadings.filter((heading) => heading.level === 2)
    }

    return visibleHeadings
  }, [visibleHeadings])
  const [activeId, setActiveId] = useState(compactHeadings[0]?.id ?? "")

  useEffect(() => {
    if (compactHeadings.length === 0) {
      return
    }

    const updateActiveHeading = () => {
      setActiveId(resolveActiveHeadingId(compactHeadings))
    }

    const container = findScrollContainer()
    updateActiveHeading()

    if (!container) {
      window.addEventListener("scroll", updateActiveHeading, { passive: true })
      window.addEventListener("resize", updateActiveHeading)

      return () => {
        window.removeEventListener("scroll", updateActiveHeading)
        window.removeEventListener("resize", updateActiveHeading)
      }
    }

    container.addEventListener("scroll", updateActiveHeading, { passive: true })
    window.addEventListener("resize", updateActiveHeading)

    return () => {
      container.removeEventListener("scroll", updateActiveHeading)
      window.removeEventListener("resize", updateActiveHeading)
    }
  }, [compactHeadings])

  if (compactHeadings.length === 0) {
    return null
  }

  return (
    <aside className={cn("rounded-lg border border-border/60 bg-card/80 p-2.5", className)}>
      <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted-foreground">页内导航</p>
      <nav aria-label="页内章节导航">
        <ul className="space-y-0.5">
          {compactHeadings.map((heading) => {
            const isActive = heading.id === activeId

            return (
              <li key={heading.id}>
                <button
                  type="button"
                  className={cn(
                    "w-full rounded-md px-1.5 py-1 text-left text-[11px] leading-4 transition-colors",
                    heading.level === 3 ? "pl-4" : "pl-1.5",
                    isActive
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                  onClick={() => {
                    const element = getHeadingElement(heading.id)

                    if (!element) {
                      return
                    }

                    element.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })

                    window.history.replaceState(null, "", `#${heading.id}`)
                    setActiveId(heading.id)
                  }}
                  title={heading.text}
                >
                  <span className="block truncate">{heading.text}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
