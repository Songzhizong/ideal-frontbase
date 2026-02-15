import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import type * as React from "react"
import { createContext, useContext, useMemo, useState } from "react"
import { cn } from "@/packages/ui-utils"
import { Button } from "./button"

export type TimelineMode = "left" | "right" | "alternate"
export type TimelineColor = "default" | "primary" | "success" | "warning" | "error" | "info"

export interface TimelineItem {
  key?: React.Key
  title?: React.ReactNode | undefined
  description?: React.ReactNode | undefined
  time?: React.ReactNode | undefined
  dot?: React.ReactNode | undefined
  color?: TimelineColor | undefined
  children?: React.ReactNode | undefined
  className?: string | undefined
}

interface TimelineContextValue {
  mode: TimelineMode
}

const TimelineContext = createContext<TimelineContextValue | null>(null)

export interface TimelineItemProps extends Omit<React.ComponentProps<"li">, "children" | "title"> {
  title?: React.ReactNode | undefined
  description?: React.ReactNode | undefined
  time?: React.ReactNode | undefined
  dot?: React.ReactNode | undefined
  color?: TimelineColor | undefined
  children?: React.ReactNode
}

export interface TimelineProps extends Omit<React.ComponentProps<"ol">, "children"> {
  items?: TimelineItem[] | undefined
  children?: React.ReactNode
  mode?: TimelineMode | undefined
  collapsible?: boolean | undefined
  collapseCount?: number | undefined
  collapsed?: boolean | undefined
  defaultCollapsed?: boolean | undefined
  onCollapsedChange?: ((collapsed: boolean) => void) | undefined
  expandText?: React.ReactNode | undefined
  collapseText?: React.ReactNode | undefined
}

const DOT_COLOR_CLASSNAME: Record<TimelineColor, string> = {
  default: "border-border bg-background text-foreground",
  primary: "border-primary/30 bg-primary/10 text-primary",
  success: "border-success/30 bg-success-subtle text-success",
  warning: "border-warning/30 bg-warning-subtle text-warning",
  error: "border-error/30 bg-error-subtle text-error",
  info: "border-info/30 bg-info-subtle text-info",
}

function useControllableCollapsed({
  collapsed,
  defaultCollapsed,
  onCollapsedChange,
}: {
  collapsed?: boolean | undefined
  defaultCollapsed?: boolean | undefined
  onCollapsedChange?: ((collapsed: boolean) => void) | undefined
}) {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed ?? true)
  const isControlled = collapsed !== undefined
  const resolvedCollapsed = isControlled ? collapsed : internalCollapsed

  const setCollapsed = (next: boolean) => {
    if (!isControlled) {
      setInternalCollapsed(next)
    }
    onCollapsedChange?.(next)
  }

  return { collapsed: resolvedCollapsed, setCollapsed }
}

function resolveSide(mode: TimelineMode, index: number): "left" | "right" {
  if (mode === "right") {
    return "right"
  }
  if (mode === "left") {
    return "left"
  }
  return index % 2 === 0 ? "left" : "right"
}

function resolveLineClassName(mode: TimelineMode) {
  if (mode === "alternate") {
    return "left-1/2 -translate-x-1/2"
  }
  if (mode === "right") {
    return "right-[10px]"
  }
  return "left-[10px]"
}

function TimelineItemContent({
  title,
  description,
  time,
  children,
}: {
  title?: React.ReactNode | undefined
  description?: React.ReactNode | undefined
  time?: React.ReactNode | undefined
  children?: React.ReactNode
}) {
  return (
    <div
      data-slot="timeline-content"
      className="min-w-0 rounded-lg border border-border/50 bg-card px-4 py-3"
    >
      {time ? <div className="text-xs text-muted-foreground">{time}</div> : null}
      {title ? <div className="text-sm font-medium text-foreground">{title}</div> : null}
      {description ? <div className="mt-1 text-sm text-muted-foreground">{description}</div> : null}
      {children ? <div className="mt-2 text-sm text-foreground">{children}</div> : null}
    </div>
  )
}

export function TimelineItem({
  title,
  description,
  time,
  dot,
  color = "default",
  children,
  className,
  ...props
}: TimelineItemProps) {
  const context = useContext(TimelineContext)
  const mode = context?.mode ?? "left"

  return (
    <li data-slot="timeline-item" className={cn("relative", className)} {...props}>
      <div
        className={cn(
          "relative min-h-8 items-start gap-4",
          mode === "alternate"
            ? "grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]"
            : mode === "right"
              ? "grid grid-cols-[minmax(0,1fr)_auto]"
              : "grid grid-cols-[auto_minmax(0,1fr)]",
        )}
      >
        {mode === "right" ? (
          <div className="col-start-1 text-right">
            <TimelineItemContent title={title} description={description} time={time}>
              {children}
            </TimelineItemContent>
          </div>
        ) : null}
        <span
          aria-hidden
          className={cn(
            "z-10 inline-flex size-5 shrink-0 items-center justify-center rounded-full border",
            DOT_COLOR_CLASSNAME[color],
            mode === "alternate" ? "col-start-2" : mode === "right" ? "col-start-2" : "col-start-1",
          )}
        >
          {dot}
        </span>
        {mode !== "right" ? (
          <div className={cn(mode === "alternate" ? "col-span-2" : "col-start-2")}>
            <TimelineItemContent title={title} description={description} time={time}>
              {children}
            </TimelineItemContent>
          </div>
        ) : null}
      </div>
    </li>
  )
}

function AlternateTimelineItem({
  title,
  description,
  time,
  dot,
  color = "default",
  children,
  side,
  className,
}: {
  title?: React.ReactNode | undefined
  description?: React.ReactNode | undefined
  time?: React.ReactNode | undefined
  dot?: React.ReactNode | undefined
  color?: TimelineColor | undefined
  children?: React.ReactNode
  side: "left" | "right"
  className?: string | undefined
}) {
  return (
    <li data-slot="timeline-item" className={cn("relative", className)}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-4">
        {side === "left" ? (
          <div className="col-start-1">
            <TimelineItemContent title={title} description={description} time={time}>
              {children}
            </TimelineItemContent>
          </div>
        ) : (
          <div className="col-start-1" />
        )}
        <span
          aria-hidden
          className={cn(
            "col-start-2 z-10 mt-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full border",
            DOT_COLOR_CLASSNAME[color],
          )}
        >
          {dot}
        </span>
        {side === "right" ? (
          <div className="col-start-3 text-right">
            <TimelineItemContent title={title} description={description} time={time}>
              {children}
            </TimelineItemContent>
          </div>
        ) : (
          <div className="col-start-3" />
        )}
      </div>
    </li>
  )
}

export function Timeline({
  items,
  children,
  mode = "left",
  collapsible = false,
  collapseCount = 6,
  collapsed,
  defaultCollapsed,
  onCollapsedChange,
  expandText = "展开全部",
  collapseText = "收起",
  className,
  ...props
}: TimelineProps) {
  const { collapsed: resolvedCollapsed, setCollapsed } = useControllableCollapsed({
    collapsed,
    defaultCollapsed,
    onCollapsedChange,
  })

  const rawItems = useMemo(() => items ?? [], [items])
  const canCollapse = collapsible && rawItems.length > collapseCount
  const visibleItems =
    canCollapse && resolvedCollapsed ? rawItems.slice(0, collapseCount) : rawItems

  return (
    <TimelineContext value={{ mode }}>
      <div data-slot="timeline" className={cn("space-y-3", className)}>
        <ol
          data-mode={mode}
          className={cn(
            "relative space-y-4",
            mode === "left" ? "pl-0" : "",
            mode === "right" ? "pr-0" : "",
          )}
          {...props}
        >
          <span
            aria-hidden
            className={cn("bg-border/60 absolute top-1 bottom-1 w-px", resolveLineClassName(mode))}
          />
          {items
            ? visibleItems.map((item, index) => {
                if (mode === "alternate") {
                  return (
                    <AlternateTimelineItem
                      key={
                        item.key ??
                        `${index}-${typeof item.title === "string" ? item.title : "event"}`
                      }
                      title={item.title}
                      description={item.description}
                      time={item.time}
                      dot={item.dot}
                      color={item.color}
                      side={resolveSide(mode, index)}
                      className={item.className}
                    >
                      {item.children}
                    </AlternateTimelineItem>
                  )
                }

                return (
                  <TimelineItem
                    key={
                      item.key ??
                      `${index}-${typeof item.title === "string" ? item.title : "event"}`
                    }
                    title={item.title}
                    description={item.description}
                    time={item.time}
                    dot={item.dot}
                    color={item.color}
                    className={item.className}
                  >
                    {item.children}
                  </TimelineItem>
                )
              })
            : children}
        </ol>
        {canCollapse ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!resolvedCollapsed)}
            className="cursor-pointer"
          >
            {resolvedCollapsed ? (
              <ChevronDownIcon aria-hidden className="size-4" />
            ) : (
              <ChevronUpIcon aria-hidden className="size-4" />
            )}
            {resolvedCollapsed ? expandText : collapseText}
          </Button>
        ) : null}
      </div>
    </TimelineContext>
  )
}
