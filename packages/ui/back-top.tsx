import { ArrowUpIcon } from "lucide-react"
import type * as React from "react"
import { useEffect, useState } from "react"
import { cn } from "@/packages/ui-utils"
import { Button } from "./button"

export interface BackTopProps extends Omit<React.ComponentProps<"button">, "onClick"> {
  target?: (() => HTMLElement | Window | null) | undefined
  visibleHeight?: number | undefined
  right?: number | string | undefined
  bottom?: number | string | undefined
  onClick?:
    | ((event: React.MouseEvent<HTMLButtonElement>, scrollToTop: () => void) => void)
    | undefined
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

function scrollToTop(container: HTMLElement | Window) {
  if (isWindowContainer(container)) {
    container.scrollTo({ top: 0, behavior: "smooth" })
    return
  }
  container.scrollTo({ top: 0, behavior: "smooth" })
}

export function BackTop({
  target,
  visibleHeight = 240,
  right = 24,
  bottom = 24,
  onClick,
  className,
  children,
  ...props
}: BackTopProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const container = resolveContainer(target)
    if (!container) {
      return
    }

    const updateVisible = () => {
      setVisible(getScrollTop(container) >= visibleHeight)
    }

    updateVisible()
    container.addEventListener("scroll", updateVisible, { passive: true })

    return () => {
      container.removeEventListener("scroll", updateVisible)
    }
  }, [target, visibleHeight])

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const container = resolveContainer(target)
    if (!container) {
      return
    }

    const runScroll = () => {
      scrollToTop(container)
    }

    if (onClick) {
      onClick(event, runScroll)
      return
    }

    runScroll()
  }

  return (
    <div
      data-slot="back-top"
      className={cn(
        "fixed z-50 transition-all duration-200",
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0 pointer-events-none",
      )}
      style={{ right, bottom }}
    >
      <Button
        type="button"
        size="lg"
        shape="square"
        className={cn("cursor-pointer rounded-full shadow-lg", className)}
        aria-label="返回顶部"
        onClick={handleClick}
        {...props}
      >
        {children ?? <ArrowUpIcon aria-hidden className="size-4" />}
      </Button>
    </div>
  )
}
