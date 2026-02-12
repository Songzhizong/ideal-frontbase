import type * as React from "react"
import { cn } from "@/packages/ui-utils"

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
}

export function PageHeader({ title, description, actions, className, ...props }: PageHeaderProps) {
  return (
    <header
      className={cn("flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between", className)}
      {...props}
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? (
          <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}
