import { DocCodeBlock } from "@/features/component-docs/components/doc-code-block"
import { renderMarkdownTextBlock } from "@/features/component-docs/components/markdown-doc-renderer.utils"
import { createHeadingIdResolver } from "@/features/component-docs/components/markdown-heading"
import { splitMarkdownBlocks } from "@/features/component-docs/components/markdown-parsing"
import { PlaygroundGallery } from "@/features/component-docs/components/playground-gallery"
import { cn } from "@/packages/ui-utils"

interface MarkdownDocRendererProps {
  content: string
  component: string
  className?: string | undefined
}

export function MarkdownDocRenderer({ content, component, className }: MarkdownDocRendererProps) {
  const blocks = splitMarkdownBlocks(content)
  const resolveHeadingId = createHeadingIdResolver()

  if (blocks.length === 0) {
    return null
  }

  return (
    <section className={cn("space-y-6", className)}>
      {blocks.map((block, index) => {
        if (block.type === "playground") {
          return (
            <PlaygroundGallery
              key={`playground-${index}`}
              component={component}
              files={block.files}
            />
          )
        }

        if (block.type === "code") {
          return (
            <DocCodeBlock
              key={`code-${index}`}
              code={block.content}
              language={block.language}
              defaultOpen
            />
          )
        }

        return (
          <div key={`text-${index}`} className="space-y-4">
            {renderMarkdownTextBlock(block.content, {
              resolveHeadingId,
            })}
          </div>
        )
      })}
    </section>
  )
}
