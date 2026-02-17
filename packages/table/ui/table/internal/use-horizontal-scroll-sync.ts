import { type Dispatch, type RefObject, type SetStateAction, useEffect } from "react"

interface UseHorizontalScrollSyncArgs {
  useSplitHeaderBody: boolean
  useRootSplitHeaderBody: boolean
  useWindowSplitHeaderBody: boolean
  wrapperRef: RefObject<HTMLDivElement | null>
  splitHeaderScrollRef: RefObject<HTMLDivElement | null>
  splitBodyViewportRef: RefObject<HTMLDivElement | null>
  splitFooterScrollRef: RefObject<HTMLDivElement | null>
  syncRafRef: RefObject<number | null>
  syncingTargetRef: RefObject<"header" | "body" | "footer" | null>
  setScrollEdges: Dispatch<SetStateAction<{ left: boolean; right: boolean }>>
}

export function useHorizontalScrollSync({
  useSplitHeaderBody,
  useRootSplitHeaderBody,
  useWindowSplitHeaderBody,
  wrapperRef,
  splitHeaderScrollRef,
  splitBodyViewportRef,
  splitFooterScrollRef,
  syncRafRef,
  syncingTargetRef,
  setScrollEdges,
}: UseHorizontalScrollSyncArgs) {
  useEffect(() => {
    const wrapperElement = wrapperRef.current
    const defaultScrollElement = wrapperElement?.matches('[data-slot="table-container"]')
      ? wrapperElement
      : wrapperElement?.querySelector<HTMLDivElement>('[data-slot="table-container"]')
    const headerScrollElement = useSplitHeaderBody ? splitHeaderScrollRef.current : null
    const bodyHorizontalScrollElement = useRootSplitHeaderBody
      ? splitBodyViewportRef.current
      : defaultScrollElement
    const footerScrollElement = useWindowSplitHeaderBody ? splitFooterScrollRef.current : null

    if (!bodyHorizontalScrollElement) return

    const setFooterContentWidth = () => {
      if (!footerScrollElement) return
      const footerContent = footerScrollElement.firstElementChild
      if (!(footerContent instanceof HTMLElement)) return
      footerContent.style.width = `${bodyHorizontalScrollElement.scrollWidth}px`
    }

    const syncFooterScroll = () => {
      if (!footerScrollElement) return
      setFooterContentWidth()
      if (Math.abs(footerScrollElement.scrollLeft - bodyHorizontalScrollElement.scrollLeft) > 0.5) {
        syncingTargetRef.current = "footer"
        footerScrollElement.scrollLeft = bodyHorizontalScrollElement.scrollLeft
      }
    }

    const updateEdges = () => {
      const left = bodyHorizontalScrollElement.scrollLeft > 0
      const right =
        bodyHorizontalScrollElement.scrollLeft + bodyHorizontalScrollElement.clientWidth <
        Math.max(0, bodyHorizontalScrollElement.scrollWidth - 1)
      setScrollEdges((prev) =>
        prev.left === left && prev.right === right ? prev : { left, right },
      )
    }

    const syncHeaderScroll = () => {
      if (!headerScrollElement) return
      if (headerScrollElement.scrollLeft !== bodyHorizontalScrollElement.scrollLeft) {
        if (!useWindowSplitHeaderBody) {
          syncingTargetRef.current = "header"
        }
        headerScrollElement.scrollLeft = bodyHorizontalScrollElement.scrollLeft
      }
    }

    const handleBodyHorizontalScroll = () => {
      if (syncingTargetRef.current === "body") {
        syncingTargetRef.current = null
        updateEdges()
        return
      }

      if (syncRafRef.current != null) {
        cancelAnimationFrame(syncRafRef.current)
      }
      syncRafRef.current = requestAnimationFrame(() => {
        if (headerScrollElement) {
          const shouldSyncHeader =
            Math.abs(headerScrollElement.scrollLeft - bodyHorizontalScrollElement.scrollLeft) > 0.5
          if (shouldSyncHeader) {
            if (!useWindowSplitHeaderBody) {
              syncingTargetRef.current = "header"
            }
            headerScrollElement.scrollLeft = bodyHorizontalScrollElement.scrollLeft
          }
        }
        syncFooterScroll()
        updateEdges()
        syncRafRef.current = null
      })
    }

    const handleHeaderHorizontalScroll = () => {
      if (!headerScrollElement) return

      if (syncingTargetRef.current === "header") {
        syncingTargetRef.current = null
        return
      }

      if (syncRafRef.current != null) {
        cancelAnimationFrame(syncRafRef.current)
      }
      syncRafRef.current = requestAnimationFrame(() => {
        if (
          Math.abs(bodyHorizontalScrollElement.scrollLeft - headerScrollElement.scrollLeft) > 0.5
        ) {
          syncingTargetRef.current = "body"
          bodyHorizontalScrollElement.scrollLeft = headerScrollElement.scrollLeft
        }
        updateEdges()
        syncRafRef.current = null
      })
    }

    const handleFooterHorizontalScroll = () => {
      if (!footerScrollElement) return

      if (syncingTargetRef.current === "footer") {
        syncingTargetRef.current = null
        return
      }

      if (syncRafRef.current != null) {
        cancelAnimationFrame(syncRafRef.current)
      }
      syncRafRef.current = requestAnimationFrame(() => {
        if (
          Math.abs(bodyHorizontalScrollElement.scrollLeft - footerScrollElement.scrollLeft) > 0.5
        ) {
          syncingTargetRef.current = "body"
          bodyHorizontalScrollElement.scrollLeft = footerScrollElement.scrollLeft
        }
        if (
          headerScrollElement &&
          Math.abs(headerScrollElement.scrollLeft - footerScrollElement.scrollLeft) > 0.5
        ) {
          headerScrollElement.scrollLeft = footerScrollElement.scrollLeft
        }
        updateEdges()
        syncRafRef.current = null
      })
    }

    const handleHeaderWheel = (event: WheelEvent) => {
      const deltaX = event.deltaX !== 0 ? event.deltaX : event.shiftKey ? event.deltaY : 0
      if (Math.abs(deltaX) < 0.5) return
      event.preventDefault()
      bodyHorizontalScrollElement.scrollLeft += deltaX
    }

    updateEdges()
    syncHeaderScroll()
    syncFooterScroll()

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            updateEdges()
            syncHeaderScroll()
            syncFooterScroll()
          })

    if (resizeObserver) {
      resizeObserver.observe(bodyHorizontalScrollElement)
      const bodyContent = bodyHorizontalScrollElement.firstElementChild
      if (bodyContent) {
        resizeObserver.observe(bodyContent)
      }
    }

    const handleResize = () => {
      updateEdges()
      syncHeaderScroll()
      syncFooterScroll()
    }

    bodyHorizontalScrollElement.addEventListener("scroll", handleBodyHorizontalScroll, {
      passive: true,
    })
    if (!useWindowSplitHeaderBody) {
      headerScrollElement?.addEventListener("scroll", handleHeaderHorizontalScroll, {
        passive: true,
      })
    }
    if (useWindowSplitHeaderBody && headerScrollElement) {
      headerScrollElement.addEventListener("wheel", handleHeaderWheel, {
        passive: false,
      })
    }
    footerScrollElement?.addEventListener("scroll", handleFooterHorizontalScroll, {
      passive: true,
    })

    window.addEventListener("resize", handleResize)
    return () => {
      if (syncRafRef.current != null) {
        cancelAnimationFrame(syncRafRef.current)
        syncRafRef.current = null
      }
      bodyHorizontalScrollElement.removeEventListener("scroll", handleBodyHorizontalScroll)
      if (!useWindowSplitHeaderBody) {
        headerScrollElement?.removeEventListener("scroll", handleHeaderHorizontalScroll)
      }
      if (useWindowSplitHeaderBody && headerScrollElement) {
        headerScrollElement.removeEventListener("wheel", handleHeaderWheel)
      }
      footerScrollElement?.removeEventListener("scroll", handleFooterHorizontalScroll)
      window.removeEventListener("resize", handleResize)
      resizeObserver?.disconnect()
    }
  }, [
    setScrollEdges,
    splitBodyViewportRef,
    splitFooterScrollRef,
    splitHeaderScrollRef,
    syncRafRef,
    syncingTargetRef,
    useRootSplitHeaderBody,
    useSplitHeaderBody,
    useWindowSplitHeaderBody,
    wrapperRef,
  ])
}
