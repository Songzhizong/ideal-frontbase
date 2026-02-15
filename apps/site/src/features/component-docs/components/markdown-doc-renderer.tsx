import { DocCodeBlock } from "@/features/component-docs/components/doc-code-block"
import {
  extractMarkdownHeadings,
  type MarkdownHeading,
  renderMarkdownTextBlock,
} from "@/features/component-docs/components/markdown-doc-renderer.utils"
import { PlaygroundGallery } from "@/features/component-docs/components/playground-gallery"
import { cn } from "@/packages/ui-utils"

interface MarkdownDocRendererProps {
  content: string
  component: string
  headings?: readonly MarkdownHeading[] | undefined
  className?: string | undefined
}

type MarkdownBlock =
  | {
      type: "code"
      language: string
      content: string
    }
  | {
      type: "text"
      content: string
    }
  | {
      type: "playground"
      files: string[]
    }

function splitMarkdownBlocks(content: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = []
  const lines = content.split("\n")
  let cursor = 0

  while (cursor < lines.length) {
    const line = lines[cursor] ?? ""

    if (line.startsWith("```")) {
      const language = line.slice(3).trim()
      const codeLines: string[] = []
      cursor += 1

      while (cursor < lines.length && !(lines[cursor] ?? "").startsWith("```")) {
        codeLines.push(lines[cursor] ?? "")
        cursor += 1
      }

      if (language === "playground") {
        const files = codeLines.map((codeLine) => codeLine.trim()).filter(Boolean)
        blocks.push({ type: "playground", files })
        cursor += 1
        continue
      }

      blocks.push({
        type: "code",
        language,
        content: codeLines.join("\n").trimEnd(),
      })

      cursor += 1
      continue
    }

    const textLines: string[] = []
    while (cursor < lines.length && !(lines[cursor] ?? "").startsWith("```")) {
      textLines.push(lines[cursor] ?? "")
      cursor += 1
    }

    const text = textLines.join("\n").trim()
    if (text.length > 0) {
      blocks.push({ type: "text", content: text })
    }
  }

  return blocks
}

export function MarkdownDocRenderer({
  content,
  component,
  headings,
  className,
}: MarkdownDocRendererProps) {
  const blocks = splitMarkdownBlocks(content)
  const resolvedHeadings = headings ?? extractMarkdownHeadings(content)
  let headingCursor = 0

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
              getNextHeadingId: () => {
                const heading = resolvedHeadings[headingCursor]
                headingCursor += 1
                return heading?.id
              },
            })}
          </div>
        )
      })}
    </section>
  )
}
