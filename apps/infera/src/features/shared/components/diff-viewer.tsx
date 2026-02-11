import type * as React from "react"
import { useMemo } from "react"
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer-continued"
import { useResolvedTheme } from "@/packages/theme-system"
import { cn } from "@/packages/ui-utils"

function formatJsonPayload(payload: unknown) {
  if (payload === null || payload === undefined) {
    return ""
  }

  if (typeof payload === "string") {
    if (!payload.trim()) {
      return ""
    }

    try {
      const parsed = JSON.parse(payload)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return payload
    }
  }

  try {
    return JSON.stringify(payload, null, 2)
  } catch {
    return String(payload)
  }
}

export interface DiffViewerProps extends React.HTMLAttributes<HTMLDivElement> {
  before: unknown
  after: unknown
  beforeTitle?: string | React.ReactElement
  afterTitle?: string | React.ReactElement
  splitView?: boolean
  showDiffOnly?: boolean
  compareMethod?: DiffMethod
}

export function DiffViewer({
  before,
  after,
  beforeTitle = "变更前",
  afterTitle = "变更后",
  splitView = false,
  showDiffOnly = false,
  compareMethod = DiffMethod.WORDS,
  className,
  ...props
}: DiffViewerProps) {
  const resolvedTheme = useResolvedTheme()
  const oldValue = useMemo(() => formatJsonPayload(before), [before])
  const newValue = useMemo(() => formatJsonPayload(after), [after])

  return (
    <div
      className={cn("overflow-hidden rounded-lg border border-border/50 bg-card", className)}
      {...props}
    >
      <ReactDiffViewer
        oldValue={oldValue}
        newValue={newValue}
        leftTitle={beforeTitle}
        rightTitle={afterTitle}
        splitView={splitView}
        showDiffOnly={showDiffOnly}
        compareMethod={compareMethod}
        useDarkTheme={resolvedTheme === "dark"}
        styles={{
          variables: {
            light: {
              diffViewerBackground: "hsl(var(--background))",
              diffViewerColor: "hsl(var(--foreground))",
              gutterBackground: "hsl(var(--muted))",
              gutterColor: "hsl(var(--muted-foreground))",
              addedBackground: "hsl(var(--success-subtle))",
              addedColor: "hsl(var(--success-on-subtle))",
              removedBackground: "hsl(var(--error-subtle))",
              removedColor: "hsl(var(--error-on-subtle))",
              wordAddedBackground: "hsl(var(--success-subtle))",
              wordRemovedBackground: "hsl(var(--error-subtle))",
              addedGutterBackground: "hsl(var(--success-subtle))",
              removedGutterBackground: "hsl(var(--error-subtle))",
            },
            dark: {
              diffViewerBackground: "hsl(var(--background))",
              diffViewerColor: "hsl(var(--foreground))",
              gutterBackground: "hsl(var(--muted))",
              gutterColor: "hsl(var(--muted-foreground))",
              addedBackground: "hsl(var(--success-subtle))",
              addedColor: "hsl(var(--success-on-subtle))",
              removedBackground: "hsl(var(--error-subtle))",
              removedColor: "hsl(var(--error-on-subtle))",
              wordAddedBackground: "hsl(var(--success-subtle))",
              wordRemovedBackground: "hsl(var(--error-subtle))",
              addedGutterBackground: "hsl(var(--success-subtle))",
              removedGutterBackground: "hsl(var(--error-subtle))",
            },
          },
          contentText: {
            fontSize: "12px",
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace",
          },
          lineNumber: {
            fontSize: "12px",
          },
        }}
      />
    </div>
  )
}
