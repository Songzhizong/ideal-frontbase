import { AlertCircleIcon, CheckIcon } from "lucide-react"
import type * as React from "react"
import { cn } from "@/packages/ui-utils"

export type StepsDirection = "horizontal" | "vertical"
export type StepsStatus = "wait" | "process" | "finish" | "error"

export interface StepsItem {
  key?: React.Key
  title: React.ReactNode
  description?: React.ReactNode | undefined
  icon?: React.ReactNode | undefined
  status?: StepsStatus | undefined
  disabled?: boolean | undefined
}

export interface StepsProps extends Omit<React.ComponentProps<"ol">, "children"> {
  current?: number | undefined
  items: StepsItem[]
  direction?: StepsDirection | undefined
  status?: StepsStatus | undefined
  onStepChange?: ((index: number) => void) | undefined
}

const STATUS_CLASSNAME: Record<StepsStatus, string> = {
  wait: "border-border/60 bg-muted text-muted-foreground",
  process: "border-primary text-primary",
  finish: "border-primary bg-primary text-primary-foreground",
  error: "border-error/40 bg-error-subtle text-error",
}

function resolveStatus(item: StepsItem, index: number, current: number, status: StepsStatus) {
  if (item.status) {
    return item.status
  }
  if (index < current) {
    return "finish"
  }
  if (index === current) {
    return status
  }
  return "wait"
}

function renderIndicatorContent(index: number, status: StepsStatus, icon?: React.ReactNode) {
  if (icon) {
    return icon
  }
  if (status === "finish") {
    return <CheckIcon aria-hidden className="size-4" />
  }
  if (status === "error") {
    return <AlertCircleIcon aria-hidden className="size-4" />
  }
  return <span className="text-xs font-medium">{index + 1}</span>
}

export function Steps({
  current = 0,
  items,
  direction = "horizontal",
  status = "process",
  onStepChange,
  className,
  ...props
}: StepsProps) {
  return (
    <ol
      data-slot="steps"
      data-direction={direction}
      className={cn(
        direction === "horizontal"
          ? "flex flex-col gap-3 md:flex-row md:items-center"
          : "flex flex-col gap-3",
        className,
      )}
      {...props}
    >
      {items.map((item, index) => {
        const itemStatus = resolveStatus(item, index, current, status)
        const clickable = Boolean(onStepChange) && !item.disabled
        const indicator = (
          <span
            className={cn(
              "inline-flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors",
              STATUS_CLASSNAME[itemStatus],
            )}
          >
            {renderIndicatorContent(index, itemStatus, item.icon)}
          </span>
        )

        const content = (
          <>
            {indicator}
            <span className="min-w-0 text-left">
              <span className="block truncate text-sm font-medium text-foreground">
                {item.title}
              </span>
              {item.description ? (
                <span className="block truncate text-xs text-muted-foreground">
                  {item.description}
                </span>
              ) : null}
            </span>
          </>
        )

        return (
          <li
            key={item.key ?? `${index}-${typeof item.title === "string" ? item.title : "step"}`}
            className={cn(
              "flex min-w-0 items-start gap-2.5",
              direction === "horizontal" ? "md:flex-1 md:items-center" : "",
            )}
          >
            {clickable ? (
              <button
                type="button"
                disabled={item.disabled}
                className="flex min-w-0 cursor-pointer items-start gap-2.5 text-left transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => onStepChange?.(index)}
              >
                {content}
              </button>
            ) : (
              <div className="flex min-w-0 items-start gap-2.5">{content}</div>
            )}
            {index < items.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "rounded-full bg-border/60",
                  direction === "horizontal"
                    ? "hidden h-0.5 flex-1 self-center md:block"
                    : "ml-4 mt-8 h-6 w-0.5",
                )}
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}
