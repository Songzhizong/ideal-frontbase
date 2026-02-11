import { Tag } from "lucide-react"
import type * as React from "react"
import { BaseLink } from "@/packages/platform-router"
import { Badge } from "@/packages/ui/badge"
import { cn } from "@/packages/ui-utils"

export interface ModelTagChip {
  name: string
  versionId: string
  to?: string
  disabled?: boolean
}

export interface TagChipsProps extends React.HTMLAttributes<HTMLDivElement> {
  tags: ModelTagChip[]
  onTagClick?: (tag: ModelTagChip) => void
  emptyText?: string
}

function getTagClassName(tagName: string) {
  const normalizedTag = tagName.trim().toLowerCase()

  if (normalizedTag === "prod") {
    return "border-red-500/20 bg-red-500/10 text-red-500"
  }

  if (normalizedTag === "staging") {
    return "border-amber-500/20 bg-amber-500/10 text-amber-500"
  }

  if (normalizedTag === "latest") {
    return "border-blue-500/20 bg-blue-500/10 text-blue-500"
  }

  return "border-border/60 bg-muted text-muted-foreground"
}

function TagChip({
  tag,
  onTagClick,
}: {
  tag: ModelTagChip
  onTagClick: ((tag: ModelTagChip) => void) | undefined
}) {
  const badgeClassName = cn(
    "inline-flex cursor-pointer items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors",
    getTagClassName(tag.name),
    tag.disabled ? "cursor-not-allowed opacity-60" : null,
  )

  const content = (
    <>
      <Tag className="size-3" aria-hidden />
      <span>{tag.name}</span>
    </>
  )

  if (!tag.disabled && tag.to) {
    return (
      <Badge asChild variant="outline" className={badgeClassName}>
        <BaseLink
          to={tag.to}
          aria-label={`查看 Tag ${tag.name} 对应版本`}
          title={`版本 ID: ${tag.versionId}`}
        >
          {content}
        </BaseLink>
      </Badge>
    )
  }

  if (!tag.disabled && onTagClick) {
    return (
      <Badge asChild variant="outline" className={badgeClassName}>
        <button
          type="button"
          className="cursor-pointer"
          onClick={() => onTagClick(tag)}
          aria-label={`查看 Tag ${tag.name} 对应版本`}
          title={`版本 ID: ${tag.versionId}`}
        >
          {content}
        </button>
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className={badgeClassName} title={`版本 ID: ${tag.versionId}`}>
      {content}
    </Badge>
  )
}

export function TagChips({
  tags,
  onTagClick,
  emptyText = "暂无 Tag",
  className,
  ...props
}: TagChipsProps) {
  if (tags.length === 0) {
    return <span className="text-xs text-muted-foreground">{emptyText}</span>
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)} {...props}>
      {tags.map((tag) => (
        <TagChip key={`${tag.name}-${tag.versionId}`} tag={tag} onTagClick={onTagClick} />
      ))}
    </div>
  )
}
