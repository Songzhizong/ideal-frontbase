import { BadgeCheck } from "lucide-react"
import type { ReactNode } from "react"
import { Avatar, AvatarFallback } from "@/packages/ui/avatar"
import { Badge } from "@/packages/ui/badge"
import { cn } from "@/packages/ui-utils"

type AvatarSize = "default" | "sm" | "lg"

const AVATAR_TONES = [
  "bg-primary/12 text-primary",
  "bg-success/12 text-success",
  "bg-error/12 text-error",
  "bg-accent/40 text-accent-foreground",
  "bg-muted/80 text-foreground",
]

function getAvatarTone(seed: string) {
  const sum = Array.from(seed).reduce((total, char) => total + char.charCodeAt(0), 0)
  const index = Math.abs(sum) % AVATAR_TONES.length
  return AVATAR_TONES[index]
}

function hasRenderableValue(value: ReactNode | null | undefined) {
  return value !== null && value !== undefined && value !== ""
}

export interface DataTableUserIdentityCellProps {
  name: string
  subtext?: string | null
  verified?: boolean
  avatarText?: string
  avatarSeed?: string
  avatarSize?: AvatarSize
  className?: string
  subtextClassName?: string
}

export function DataTableUserIdentityCell({
  name,
  subtext,
  verified = false,
  avatarText,
  avatarSeed,
  avatarSize = "lg",
  className,
  subtextClassName,
}: DataTableUserIdentityCellProps) {
  const normalizedName = name.trim()
  const fallbackText = normalizedName.charAt(0).toUpperCase() || "U"
  const resolvedAvatarText = (avatarText?.trim() || fallbackText).slice(0, 2)
  const toneClassName = getAvatarTone(avatarSeed?.trim() || normalizedName || "user")

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Avatar size={avatarSize} className="ring-1 ring-border/60">
        <AvatarFallback className={cn("text-sm font-medium", toneClassName)}>
          {resolvedAvatarText}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-medium leading-tight text-foreground/90">
            {name}
          </span>
          {verified ? <BadgeCheck className="size-4 shrink-0 text-primary" /> : null}
        </div>
        {hasRenderableValue(subtext) ? (
          <div className={cn("mt-1 truncate text-xs text-muted-foreground/90", subtextClassName)}>
            {subtext}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export interface DataTableTextPairCellProps {
  primary: ReactNode
  secondary?: ReactNode
  className?: string
  primaryClassName?: string
  secondaryClassName?: string
}

export function DataTableTextPairCell({
  primary,
  secondary,
  className,
  primaryClassName,
  secondaryClassName,
}: DataTableTextPairCellProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      <span className={cn("truncate text-sm font-normal text-foreground/90", primaryClassName)}>
        {primary}
      </span>
      {hasRenderableValue(secondary) ? (
        <span className={cn("truncate text-xs text-muted-foreground/90", secondaryClassName)}>
          {secondary}
        </span>
      ) : null}
    </div>
  )
}

export interface DataTableTagListCellProps {
  tags?: string[]
  items?: DataTableTagItem[]
  maxVisible?: number
  emptyText?: string
  className?: string
  defaultTone?: DataTableTagTone
  overflowTone?: DataTableTagTone
  toneByLabel?: Partial<Record<string, DataTableTagTone>>
  randomTone?: boolean
  randomToneSeed?: string
}

export type DataTableTagTone = "default" | "primary" | "success" | "accent" | "error"

export interface DataTableTagItem {
  key?: string
  label: string
  tone?: DataTableTagTone
}

const TAG_TONE_CLASS: Record<DataTableTagTone, string> = {
  default: "border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/40",
  primary: "border-primary/15 bg-primary/5 text-primary hover:bg-primary/10",
  success: "border-success/15 bg-success/5 text-success hover:bg-success/10",
  accent: "border-accent/25 bg-accent/20 text-accent-foreground hover:bg-accent/30",
  error: "border-error/15 bg-error/5 text-error hover:bg-error/10",
}

const RANDOM_TAG_TONES: DataTableTagTone[] = ["primary", "success", "accent"]

function hashText(text: string) {
  return Array.from(text).reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 0)
}

export function DataTableTagListCell({
  tags,
  items,
  maxVisible = 2,
  emptyText = "-",
  className,
  defaultTone = "default",
  overflowTone = "default",
  toneByLabel,
  randomTone = false,
  randomToneSeed = "default",
}: DataTableTagListCellProps) {
  const normalizedItems: DataTableTagItem[] = (() => {
    if (Array.isArray(items) && items.length > 0) return items
    if (Array.isArray(tags) && tags.length > 0) {
      return tags.map((tag): DataTableTagItem => ({ label: tag }))
    }
    return []
  })()

  if (normalizedItems.length === 0) {
    return <span className="text-xs text-muted-foreground">{emptyText}</span>
  }

  const resolveTone = (item: DataTableTagItem): DataTableTagTone => {
    if (item.tone) return item.tone
    const mappedTone = toneByLabel?.[item.label]
    if (mappedTone) return mappedTone
    if (randomTone) {
      const hash = hashText(`${randomToneSeed}:${item.label}`)
      return RANDOM_TAG_TONES[hash % RANDOM_TAG_TONES.length] ?? defaultTone
    }
    return defaultTone
  }

  const visible = normalizedItems.slice(0, maxVisible)
  const overflow = Math.max(0, normalizedItems.length - visible.length)

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {visible.map((item, index) => (
        <Badge
          key={item.key ?? `${index}-${item.label}`}
          variant="outline"
          className={cn(
            "h-7 max-w-44 rounded-md px-3 text-xs font-medium",
            TAG_TONE_CLASS[resolveTone(item)],
          )}
          title={item.label}
        >
          <span className="truncate">{item.label}</span>
        </Badge>
      ))}
      {overflow > 0 ? (
        <Badge
          variant="outline"
          className={cn("h-7 rounded-md px-2.5 text-xs font-medium", TAG_TONE_CLASS[overflowTone])}
        >
          +{overflow}
        </Badge>
      ) : null}
    </div>
  )
}

export type DataTableIndicatorTone = "default" | "muted" | "primary" | "success" | "error"

const INDICATOR_TONE_CLASS: Record<DataTableIndicatorTone, string> = {
  default: "text-foreground/90",
  muted: "text-muted-foreground/90",
  primary: "text-primary/90",
  success: "text-success/90",
  error: "text-error/90",
}

export interface DataTableIndicatorItem {
  key?: string
  label: string
  icon?: ReactNode
  tone?: DataTableIndicatorTone
}

export interface DataTableIndicatorListProps {
  items: DataTableIndicatorItem[]
  className?: string
  itemClassName?: string
}

export function DataTableIndicatorList({
  items,
  className,
  itemClassName,
}: DataTableIndicatorListProps) {
  return (
    <div className={cn("flex flex-col items-start gap-1.5", className)}>
      {items.map((item, index) => (
        <div
          key={item.key ?? `${index}-${item.label}`}
          className={cn(
            "flex min-w-0 items-center gap-2 text-xs font-normal",
            INDICATOR_TONE_CLASS[item.tone ?? "default"],
            itemClassName,
          )}
        >
          {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
          <span className="truncate">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export type DataTableStatusTone = "default" | "primary" | "success" | "error"

const STATUS_PILL_CLASS: Record<DataTableStatusTone, string> = {
  default: "border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/40",
  primary: "border-primary/15 bg-primary/5 text-primary hover:bg-primary/10",
  success: "border-success/15 bg-success/5 text-success hover:bg-success/10",
  error: "border-error/15 bg-error/5 text-error hover:bg-error/10",
}

const STATUS_DOT_CLASS: Record<DataTableStatusTone, string> = {
  default: "bg-muted-foreground",
  primary: "bg-primary",
  success: "bg-success",
  error: "bg-error",
}

export interface DataTableStatusPillProps {
  label: string
  tone?: DataTableStatusTone
  showDot?: boolean
  className?: string
}

export function DataTableStatusPill({
  label,
  tone = "default",
  showDot = true,
  className,
}: DataTableStatusPillProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "h-6 rounded-full px-2.5 text-xs font-normal",
        STATUS_PILL_CLASS[tone],
        className,
      )}
    >
      {showDot ? (
        <span className={cn("mr-1.5 size-1.5 rounded-full", STATUS_DOT_CLASS[tone])} />
      ) : null}
      {label}
    </Badge>
  )
}

export interface DataTableTimeMetaCellProps {
  primary: ReactNode
  secondary?: ReactNode
  className?: string
  primaryClassName?: string
  secondaryClassName?: string
}

export function DataTableTimeMetaCell({
  primary,
  secondary,
  className,
  primaryClassName,
  secondaryClassName,
}: DataTableTimeMetaCellProps) {
  return (
    <DataTableTextPairCell
      primary={primary}
      secondary={secondary}
      className={className ?? ""}
      primaryClassName={cn("tabular-nums", primaryClassName)}
      secondaryClassName={cn("tabular-nums", secondaryClassName)}
    />
  )
}
