import { AlertCircle, ChevronDown, ChevronUp, RotateCcw } from "lucide-react"
import type * as React from "react"
import { useMemo, useState } from "react"
import { Button } from "@/packages/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/packages/ui/collapsible"
import { cn } from "@/packages/ui-utils"

function formatErrorDetails(error: unknown) {
  if (!error) {
    return null
  }

  if (typeof error === "string") {
    return error
  }

  if (error instanceof Error) {
    return error.stack ?? error.message
  }

  try {
    return JSON.stringify(error, null, 2)
  } catch {
    return String(error)
  }
}

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  message?: string
  error?: unknown
  retryLabel?: string
  onRetry?: () => void
}

export function ErrorState({
  title = "加载失败",
  message = "数据加载过程中出现异常，请稍后重试。",
  error,
  retryLabel = "重试",
  onRetry,
  className,
  ...props
}: ErrorStateProps) {
  const [expanded, setExpanded] = useState(false)
  const errorDetails = useMemo(() => formatErrorDetails(error), [error])

  return (
    <div
      className={cn("rounded-lg border border-destructive/30 bg-destructive/5 p-4", className)}
      {...props}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-4" aria-hidden />
          </span>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
        {onRetry ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="cursor-pointer"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            {retryLabel}
          </Button>
        ) : null}
      </div>
      {errorDetails ? (
        <Collapsible
          open={expanded}
          onOpenChange={setExpanded}
          className="mt-4 rounded-md border border-border/50 bg-background/60"
        >
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <span>{expanded ? "收起错误详情" : "查看错误详情"}</span>
              {expanded ? (
                <ChevronUp className="size-3.5" aria-hidden />
              ) : (
                <ChevronDown className="size-3.5" aria-hidden />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <pre className="max-h-60 overflow-auto border-t border-border/50 px-3 py-2 font-mono text-xs text-muted-foreground">
              {errorDetails}
            </pre>
          </CollapsibleContent>
        </Collapsible>
      ) : null}
    </div>
  )
}
