import { XIcon } from "lucide-react"
import type * as React from "react"
import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/packages/ui-utils"
import { Button } from "./button"

export type TourPlacement = "top" | "right" | "bottom" | "left" | "center"

export interface TourStep {
  key?: React.Key
  target: string | HTMLElement | (() => HTMLElement | null)
  title: React.ReactNode
  description?: React.ReactNode | undefined
  placement?: TourPlacement | undefined
  maskPadding?: number | undefined
  nextText?: React.ReactNode | undefined
  prevText?: React.ReactNode | undefined
  cover?: React.ReactNode | undefined
}

export interface TourProps extends Omit<React.ComponentProps<"div">, "onClose"> {
  steps: TourStep[]
  open?: boolean | undefined
  defaultOpen?: boolean | undefined
  onOpenChange?: ((open: boolean) => void) | undefined
  current?: number | undefined
  defaultCurrent?: number | undefined
  onCurrentChange?: ((index: number) => void) | undefined
  onClose?: (() => void) | undefined
  onFinish?: (() => void) | undefined
  maskClosable?: boolean | undefined
  showProgress?: boolean | undefined
}

interface HighlightRect {
  top: number
  left: number
  width: number
  height: number
}

function resolveTargetElement(target: TourStep["target"]) {
  if (typeof document === "undefined") {
    return null
  }
  if (typeof target === "string") {
    return document.querySelector<HTMLElement>(target)
  }
  if (typeof target === "function") {
    return target()
  }
  return target
}

function buildHighlightRect(step: TourStep): HighlightRect | null {
  const targetElement = resolveTargetElement(step.target)
  if (!targetElement) {
    return null
  }
  const rect = targetElement.getBoundingClientRect()
  const padding = step.maskPadding ?? 8
  return {
    top: rect.top - padding,
    left: rect.left - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  }
}

function clampPosition(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getCardPosition(rect: HighlightRect | null, placement: TourPlacement) {
  const viewportWidth = typeof window === "undefined" ? 1200 : window.innerWidth
  const viewportHeight = typeof window === "undefined" ? 800 : window.innerHeight
  const cardWidth = Math.min(360, viewportWidth - 32)
  const gap = 14

  if (!rect || placement === "center") {
    return {
      top: clampPosition((viewportHeight - 220) / 2, 16, Math.max(viewportHeight - 236, 16)),
      left: clampPosition(
        (viewportWidth - cardWidth) / 2,
        16,
        Math.max(viewportWidth - cardWidth - 16, 16),
      ),
      width: cardWidth,
    }
  }

  let top = rect.top
  let left = rect.left

  if (placement === "top") {
    top = rect.top - 220 - gap
    left = rect.left + rect.width / 2 - cardWidth / 2
  }
  if (placement === "bottom") {
    top = rect.top + rect.height + gap
    left = rect.left + rect.width / 2 - cardWidth / 2
  }
  if (placement === "left") {
    top = rect.top + rect.height / 2 - 110
    left = rect.left - cardWidth - gap
  }
  if (placement === "right") {
    top = rect.top + rect.height / 2 - 110
    left = rect.left + rect.width + gap
  }

  return {
    top: clampPosition(top, 16, Math.max(viewportHeight - 236, 16)),
    left: clampPosition(left, 16, Math.max(viewportWidth - cardWidth - 16, 16)),
    width: cardWidth,
  }
}

function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T | undefined
  defaultValue: T
  onChange?: ((value: T) => void) | undefined
}) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const isControlled = value !== undefined
  const resolvedValue = isControlled ? value : internalValue

  const setValue = (next: T) => {
    if (!isControlled) {
      setInternalValue(next)
    }
    onChange?.(next)
  }

  return [resolvedValue, setValue] as const
}

export function Tour({
  steps,
  open,
  defaultOpen = false,
  onOpenChange,
  current,
  defaultCurrent = 0,
  onCurrentChange,
  onClose,
  onFinish,
  maskClosable = true,
  showProgress = true,
  className,
  ...props
}: TourProps) {
  const [resolvedOpen, setResolvedOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })
  const [resolvedCurrent, setResolvedCurrent] = useControllableState({
    value: current,
    defaultValue: defaultCurrent,
    onChange: onCurrentChange,
  })
  const [rect, setRect] = useState<HighlightRect | null>(null)

  const safeCurrent = clampPosition(resolvedCurrent, 0, Math.max(steps.length - 1, 0))
  const step = steps[safeCurrent]

  useEffect(() => {
    if (!resolvedOpen || !step) {
      return
    }

    const updateRect = () => {
      setRect(buildHighlightRect(step))
    }

    updateRect()
    window.addEventListener("resize", updateRect)
    window.addEventListener("scroll", updateRect, true)

    return () => {
      window.removeEventListener("resize", updateRect)
      window.removeEventListener("scroll", updateRect, true)
    }
  }, [resolvedOpen, step])

  useEffect(() => {
    if (!resolvedOpen) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        setResolvedOpen(false)
        onClose?.()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [onClose, resolvedOpen, setResolvedOpen])

  const cardPosition = useMemo(
    () => getCardPosition(rect, step?.placement ?? "bottom"),
    [rect, step?.placement],
  )

  if (!resolvedOpen || !step || typeof document === "undefined") {
    return null
  }

  const isLast = safeCurrent >= steps.length - 1

  return createPortal(
    <div data-slot="tour" className={cn("fixed inset-0 z-50", className)} {...props}>
      <button
        type="button"
        className="absolute inset-0 bg-overlay/40"
        aria-label="关闭引导遮罩"
        onClick={() => {
          if (!maskClosable) {
            return
          }
          setResolvedOpen(false)
          onClose?.()
        }}
      />

      {rect ? (
        <div
          aria-hidden
          className="pointer-events-none absolute rounded-lg border-2 border-primary/70 shadow-[0_0_0_9999px_hsl(var(--overlay)/0.42)]"
          style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
        />
      ) : null}

      <div
        className="absolute rounded-xl border border-border/50 bg-card p-4 shadow-xl"
        style={{ top: cardPosition.top, left: cardPosition.left, width: cardPosition.width }}
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-foreground">{step.title}</h3>
            {showProgress ? (
              <p className="text-xs text-muted-foreground">
                {safeCurrent + 1} / {steps.length}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            shape="square"
            className="cursor-pointer"
            onClick={() => {
              setResolvedOpen(false)
              onClose?.()
            }}
            aria-label="关闭引导"
          >
            <XIcon aria-hidden className="size-3.5" />
          </Button>
        </div>

        {step.cover ? (
          <div className="mb-3 overflow-hidden rounded-md border border-border/50">
            {step.cover}
          </div>
        ) : null}
        {step.description ? (
          <div className="text-sm text-muted-foreground">{step.description}</div>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            disabled={safeCurrent <= 0}
            onClick={() => {
              setResolvedCurrent(Math.max(safeCurrent - 1, 0))
            }}
          >
            {step.prevText ?? "上一步"}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="cursor-pointer"
              onClick={() => {
                setResolvedOpen(false)
                onClose?.()
              }}
            >
              跳过
            </Button>
            <Button
              type="button"
              size="sm"
              className="cursor-pointer"
              onClick={() => {
                if (isLast) {
                  setResolvedOpen(false)
                  onFinish?.()
                  return
                }
                setResolvedCurrent(Math.min(safeCurrent + 1, steps.length - 1))
              }}
            >
              {isLast ? (step.nextText ?? "完成") : (step.nextText ?? "下一步")}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
