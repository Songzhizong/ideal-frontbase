import type { LucideIcon } from "lucide-react"
import { Inbox } from "lucide-react"
import type * as React from "react"
import { BaseLink } from "@/packages/platform-router"
import { Button, type ButtonProps } from "@/packages/ui/button"
import { cn } from "@/packages/ui-utils"

export interface EmptyStateAction {
  label: string
  to?: string
  onClick?: () => void
  variant?: ButtonProps["variant"]
}

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  title: string
  description?: string
  primaryAction?: EmptyStateAction
  secondaryAction?: EmptyStateAction
}

function renderAction(action: EmptyStateAction, fallbackVariant: ButtonProps["variant"]) {
  const variant = action.variant ?? fallbackVariant

  if (action.to) {
    return (
      <Button asChild variant={variant}>
        <BaseLink to={action.to} className="cursor-pointer">
          {action.label}
        </BaseLink>
      </Button>
    )
  }

  return (
    <Button type="button" variant={variant} onClick={action.onClick} className="cursor-pointer">
      {action.label}
    </Button>
  )
}

export function EmptyState({
  icon = Inbox,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
  ...props
}: EmptyStateProps) {
  const Icon = icon

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-border/50 bg-card px-6 py-16 text-center",
        className,
      )}
      {...props}
    >
      <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-6" aria-hidden />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description ? (
          <p className="max-w-xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {primaryAction || secondaryAction ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {primaryAction ? renderAction(primaryAction, "default") : null}
          {secondaryAction ? renderAction(secondaryAction, "outline") : null}
        </div>
      ) : null}
    </div>
  )
}
