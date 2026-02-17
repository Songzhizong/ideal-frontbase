import type * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { cn } from "@/packages/ui-utils"

export interface AnchorItem {
  key?: React.Key
  href: string
  title: React.ReactNode
  children?: AnchorItem[] | undefined
  disabled?: boolean | undefined
}

export interface AnchorLinkProps extends Omit<React.ComponentProps<"button">, "onClick" | "title"> {
  href: string
  title: React.ReactNode
  active?: boolean | undefined
  disabled?: boolean | undefined
  level?: number | undefined
  onClick?: ((href: string) => void) | undefined
}

export interface AnchorProps extends Omit<React.ComponentProps<"nav">, "onChange"> {
  items: AnchorItem[]
  offset?: number | undefined
  affix?: boolean | undefined
  target?: (() => HTMLElement | Window | null) | undefined
  onChange?: ((activeHref: string) => void) | undefined
}

interface FlattenAnchorItem extends Omit<AnchorItem, "children"> {
  level: number
}

function flattenItems(items: AnchorItem[], level = 0): FlattenAnchorItem[] {
  return items.flatMap((item) => {
    const current: FlattenAnchorItem = { href: item.href, title: item.title, level }
    if (item.key !== undefined) {
      current.key = item.key
    }
    if (item.disabled !== undefined) {
      current.disabled = item.disabled
    }
    if (!item.children?.length) {
      return [current]
    }
    return [current, ...flattenItems(item.children, level + 1)]
  })
}

function resolveContainer(target?: (() => HTMLElement | Window | null) | undefined) {
  if (target) {
    return target()
  }
  if (typeof window === "undefined") {
    return null
  }
  return window
}

function isWindowContainer(container: HTMLElement | Window): container is Window {
  return typeof Window !== "undefined" && container instanceof Window
}

function getScrollTop(container: HTMLElement | Window) {
  if (isWindowContainer(container)) {
    return container.scrollY || document.documentElement.scrollTop || 0
  }
  return container.scrollTop
}

function getElementTop(container: HTMLElement | Window, element: HTMLElement) {
  if (isWindowContainer(container)) {
    return element.getBoundingClientRect().top + getScrollTop(container)
  }
  const containerRect = container.getBoundingClientRect()
  return element.getBoundingClientRect().top - containerRect.top + container.scrollTop
}

function findElementByHref(href: string) {
  if (typeof document === "undefined") {
    return null
  }
  if (href.startsWith("#")) {
    const id = href.slice(1)
    if (!id) {
      return null
    }
    return document.getElementById(id)
  }
  return document.querySelector<HTMLElement>(href)
}

function scrollToElement(container: HTMLElement | Window, element: HTMLElement, offset: number) {
  const targetTop = getElementTop(container, element) - offset
  if (isWindowContainer(container)) {
    container.scrollTo({ top: targetTop, behavior: "smooth" })
    return
  }
  container.scrollTo({ top: targetTop, behavior: "smooth" })
}

export function AnchorLink({
  href,
  title,
  active = false,
  disabled = false,
  level = 0,
  onClick,
  className,
  ...props
}: AnchorLinkProps) {
  return (
    <button
      type="button"
      data-slot="anchor-link"
      data-active={active ? "true" : "false"}
      disabled={disabled}
      className={cn(
        "w-full cursor-pointer rounded-md border-l-2 px-3 py-1.5 text-left text-sm transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
        disabled ? "cursor-not-allowed opacity-60" : "",
        className,
      )}
      style={{ paddingLeft: `${level * 12 + 12}px` }}
      onClick={() => {
        if (disabled) {
          return
        }
        onClick?.(href)
      }}
      {...props}
    >
      <span className="block truncate">{title}</span>
    </button>
  )
}

export function Anchor({
  items,
  offset = 12,
  affix = true,
  target,
  onChange,
  className,
  ...props
}: AnchorProps) {
  const flatItems = useMemo(() => flattenItems(items), [items])
  const [activeHref, setActiveHref] = useState<string>(flatItems[0]?.href ?? "")

  useEffect(() => {
    const container = resolveContainer(target)
    if (!container) {
      return
    }

    const updateActiveHref = () => {
      const currentScrollTop = getScrollTop(container)
      let nextActive = flatItems[0]?.href ?? ""

      for (const item of flatItems) {
        const element = findElementByHref(item.href)
        if (!element) {
          continue
        }
        const top = getElementTop(container, element)
        if (top <= currentScrollTop + offset + 2) {
          nextActive = item.href
        }
      }

      setActiveHref((previous) => {
        if (previous === nextActive) {
          return previous
        }
        onChange?.(nextActive)
        return nextActive
      })
    }

    updateActiveHref()
    container.addEventListener("scroll", updateActiveHref, { passive: true })
    window.addEventListener("resize", updateActiveHref)

    return () => {
      container.removeEventListener("scroll", updateActiveHref)
      window.removeEventListener("resize", updateActiveHref)
    }
  }, [flatItems, offset, onChange, target])

  return (
    <nav
      data-slot="anchor"
      className={cn(
        "w-full max-w-56 rounded-lg border border-border/50 bg-card p-2",
        affix ? "sticky top-4" : "",
        className,
      )}
      {...props}
    >
      <div className="space-y-1">
        {flatItems.map((item, index) => (
          <AnchorLink
            key={item.key ?? `${index}-${item.href}`}
            href={item.href}
            title={item.title}
            level={item.level}
            active={item.href === activeHref}
            disabled={item.disabled}
            onClick={(href) => {
              const container = resolveContainer(target)
              if (!container) {
                return
              }
              const element = findElementByHref(href)
              if (!element) {
                return
              }
              scrollToElement(container, element, offset)
              setActiveHref(href)
              onChange?.(href)
            }}
          />
        ))}
      </div>
    </nav>
  )
}
