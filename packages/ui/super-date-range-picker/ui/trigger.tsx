import { ChevronDown, X } from "lucide-react"
import type { ComponentPropsWithoutRef } from "react"
import { useMemo, useSyncExternalStore } from "react"
import { cn } from "@/packages/ui-utils"
import { parseExpression, type ResolvedPayload } from "../core"
import type { LiveResolvedStore } from "../state/live-resolved-store"

type TriggerProps = ComponentPropsWithoutRef<"button"> & {
  liveStore: LiveResolvedStore
  frozenSnapshot: ResolvedPayload | null
  isOpen: boolean
  allowEmpty: boolean
  clearable: boolean
  placeholder: string
  onClear: () => void
  locale?: string
}

export function SuperDateRangePickerTrigger(props: TriggerProps) {
  const {
    liveStore,
    frozenSnapshot,
    isOpen,
    allowEmpty,
    clearable,
    placeholder,
    onClear,
    locale,
    className,
    onPointerDown,
    onClick,
    onKeyDown,
    ...buttonProps
  } = props

  const liveSnapshot = useSyncExternalStore(
    liveStore.subscribe,
    liveStore.getSnapshot,
    liveStore.getSnapshot,
  )
  const snapshot = frozenSnapshot ?? liveSnapshot
  const hasSelection = snapshot !== null
  const canClear = allowEmpty && clearable && hasSelection

  const summary = useMemo(
    () => formatSummary(snapshot, locale, placeholder),
    [snapshot, locale, placeholder],
  )

  return (
    <button
      {...buttonProps}
      type={buttonProps.type ?? "button"}
      aria-haspopup={buttonProps["aria-haspopup"] ?? "dialog"}
      aria-expanded={buttonProps["aria-expanded"] ?? isOpen}
      className={cn(
        "flex w-full min-w-[220px] items-center gap-2 rounded-md border border-border/50 bg-background px-3 py-2 text-left transition-colors hover:border-border",
        className,
      )}
      onPointerDown={(event) => {
        if (isClearActionTarget(event.target)) {
          event.preventDefault()
          event.stopPropagation()
          return
        }
        onPointerDown?.(event)
      }}
      onClick={(event) => {
        if (isClearActionTarget(event.target)) {
          event.preventDefault()
          event.stopPropagation()
          onClear()
          return
        }
        onClick?.(event)
      }}
      onKeyDown={(event) => {
        if (canClear && (event.key === "Backspace" || event.key === "Delete")) {
          event.preventDefault()
          onClear()
          return
        }
        onKeyDown?.(event)
      }}
    >
      <div
        className={cn(
          "min-w-0 flex-1 truncate text-sm",
          hasSelection ? "text-foreground" : "text-muted-foreground",
        )}
        title={hasSelection ? "时间范围" : undefined}
      >
        {summary}
      </div>

      {canClear ? (
        <span
          data-clear-action="true"
          aria-hidden="true"
          className="inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </span>
      ) : (
        <span
          aria-hidden="true"
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </span>
      )}
    </button>
  )
}

function formatSummary(
  snapshot: ResolvedPayload | null,
  locale: string | undefined,
  placeholder: string,
): string {
  if (!snapshot) {
    return placeholder
  }

  if (snapshot.definition.label && shouldPreferLabel(snapshot)) {
    return toLocalizedLabel(snapshot.definition.label)
  }

  if (snapshot.definition.ui?.manualEditorMode === "date") {
    const dateFormatter = new Intl.DateTimeFormat(locale ?? "zh-CN", {
      timeZone: snapshot.resolved.resolvedTz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    const startDate = dateFormatter.format(new Date(snapshot.resolved.startMs))
    const endDate = dateFormatter.format(new Date(snapshot.resolved.endMs))
    return `${startDate} ~ ${endDate}`
  }

  const formatter = new Intl.DateTimeFormat(locale ?? "zh-CN", {
    timeZone: snapshot.resolved.resolvedTz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  const start = formatter.format(new Date(snapshot.resolved.startMs))
  const end = formatter.format(new Date(snapshot.resolved.endMs))
  return `${start} ~ ${end}`
}

function shouldPreferLabel(snapshot: ResolvedPayload): boolean {
  try {
    const from = parseExpression(snapshot.definition.from.expr)
    const to = parseExpression(snapshot.definition.to.expr)
    return from.kind === "datemath" && to.kind === "datemath"
  } catch {
    return false
  }
}

function toLocalizedLabel(value: string): string {
  const normalized = value.trim().toLowerCase()

  if (normalized === "last 15m") return "最近 15 分钟"
  if (normalized === "last 1h") return "最近 1 小时"
  if (normalized === "last 24h") return "最近 24 小时"
  if (normalized === "today") return "今天"
  if (normalized === "yesterday") return "昨天"
  if (normalized === "this month") return "本月"

  return value
}

function isClearActionTarget(target: EventTarget | null): target is Element {
  if (!(target instanceof Element)) {
    return false
  }
  return target.closest("[data-clear-action='true']") !== null
}
