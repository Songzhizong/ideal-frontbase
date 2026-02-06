import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface DataTableToolbarProps {
  className?: string
  children?: ReactNode
  actions?: ReactNode
}

export function DataTableToolbar({ className, children, actions }: DataTableToolbarProps) {
  if (!children && !actions) return null
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2 border-b border-border/50 bg-background px-3 py-2 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{children}</div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
