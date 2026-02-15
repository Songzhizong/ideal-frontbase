import { AlertTriangle } from "lucide-react"
import { DocCodeBlock } from "@/features/component-docs/components/doc-code-block"
import {
  getPlaygroundCode,
  getPlaygroundComponent,
} from "@/features/component-docs/playground/playground-registry"
import { cn } from "@/packages/ui-utils"

interface PlaygroundGalleryProps {
  component: string
  files: readonly string[]
  className?: string | undefined
}

function getDemoTitle(file: string) {
  return file
    .split("-")
    .map((segment) => {
      if (segment.length === 0) {
        return segment
      }

      return `${segment[0]?.toUpperCase() ?? ""}${segment.slice(1)}`
    })
    .join(" ")
}

export function PlaygroundGallery({ component, files, className }: PlaygroundGalleryProps) {
  return (
    <div className={cn("grid gap-4", className)}>
      {files.map((file) => {
        const Demo = getPlaygroundComponent(component, file)
        const code = getPlaygroundCode(component, file)

        if (!Demo || !code) {
          return (
            <section
              key={`${component}-${file}`}
              className="rounded-xl border border-destructive/30 bg-destructive/5 p-4"
            >
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="size-4" />
                <p className="text-sm font-medium">示例加载失败：{file}</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                请检查
                <span className="font-code">
                  src/features/component-docs/playground/{component}/{file}.tsx
                </span>
                是否存在。
              </p>
            </section>
          )
        }

        return (
          <section
            key={`${component}-${file}`}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            <header className="border-b border-border/70 px-4 py-3">
              <h3 className="font-code text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {getDemoTitle(file)}
              </h3>
            </header>

            <div className="flex min-h-28 items-center justify-center border-b border-dashed border-border/70 bg-background/50 p-6">
              <Demo />
            </div>

            <DocCodeBlock
              code={code}
              language="tsx"
              defaultOpen={false}
              className="rounded-none border-0 border-t border-border/60"
            />
          </section>
        )
      })}
    </div>
  )
}
