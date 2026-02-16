import {
  createHeadingIdResolver,
  type MarkdownHeading,
  stripInlineFormat,
} from "@/features/component-docs/components/markdown-heading"

export type MarkdownBlock =
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

export function splitMarkdownBlocks(content: string): MarkdownBlock[] {
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

export function resolveSectionHeading(section: string): { level: 1 | 2 | 3; title: string } | null {
  if (section.startsWith("### ")) {
    return {
      level: 3,
      title: section.slice(4).trim(),
    }
  }

  if (section.startsWith("## ")) {
    return {
      level: 2,
      title: section.slice(3).trim(),
    }
  }

  if (section.startsWith("# ")) {
    return {
      level: 1,
      title: section.slice(2).trim(),
    }
  }

  return null
}

export function extractMarkdownHeadings(content: string): MarkdownHeading[] {
  const resolveHeadingId = createHeadingIdResolver()
  const headings: MarkdownHeading[] = []

  splitMarkdownBlocks(content).forEach((block) => {
    if (block.type !== "text") {
      return
    }

    const sections = block.content
      .split(/\n{2,}/)
      .map((section) => section.trim())
      .filter(Boolean)

    sections.forEach((section) => {
      const heading = resolveSectionHeading(section)

      if (!heading) {
        return
      }

      const text = stripInlineFormat(heading.title)
      const id = resolveHeadingId(heading.title)

      headings.push({ id, level: heading.level, text })
    })
  })

  return headings
}
