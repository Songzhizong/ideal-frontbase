import { Fragment, type ReactNode } from "react"
import { renderDataTableSection } from "@/features/component-docs/components/markdown-data-table"
import { resolveSectionHeading } from "@/features/component-docs/components/markdown-parsing"

type InlineToken =
  | {
      type: "text"
      value: string
    }
  | {
      type: "code"
      value: string
    }
  | {
      type: "strong"
      value: string
    }

interface MarkdownTable {
  headers: string[]
  rows: string[][]
}

interface RenderMarkdownTextBlockOptions {
  resolveHeadingId?: ((text: string) => string | undefined) | undefined
}

function parseInlineTokens(content: string): InlineToken[] {
  const tokens: InlineToken[] = []
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*)/g
  let lastIndex = 0

  for (const match of content.matchAll(pattern)) {
    const full = match[0]
    if (!full) {
      continue
    }

    const start = match.index ?? 0
    if (start > lastIndex) {
      tokens.push({
        type: "text",
        value: content.slice(lastIndex, start),
      })
    }

    if (full.startsWith("`") && full.endsWith("`")) {
      tokens.push({
        type: "code",
        value: full.slice(1, -1),
      })
    } else if (full.startsWith("**") && full.endsWith("**")) {
      tokens.push({
        type: "strong",
        value: full.slice(2, -2),
      })
    } else {
      tokens.push({
        type: "text",
        value: full,
      })
    }

    lastIndex = start + full.length
  }

  if (lastIndex < content.length) {
    tokens.push({
      type: "text",
      value: content.slice(lastIndex),
    })
  }

  if (tokens.length === 0) {
    return [{ type: "text", value: content }]
  }

  return tokens
}

function renderInlineText(content: string, keyPrefix: string): ReactNode {
  return parseInlineTokens(content).map((token, index) => {
    const key = `${keyPrefix}-${index}`

    if (token.type === "code") {
      return (
        <code key={key} className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">
          {token.value}
        </code>
      )
    }

    if (token.type === "strong") {
      return (
        <strong key={key} className="font-semibold text-foreground">
          {token.value}
        </strong>
      )
    }

    return <Fragment key={key}>{token.value}</Fragment>
  })
}

function normalizePipeRow(line: string) {
  return line.replace(/^\|/, "").replace(/\|$/, "").trim()
}

function parseTableRow(line: string) {
  return normalizePipeRow(line)
    .split("|")
    .map((cell) => cell.trim())
}

function isTableDivider(line: string) {
  const cells = parseTableRow(line)

  if (cells.length === 0) {
    return false
  }

  return cells.every((cell) => /^:?-{3,}:?$/.test(cell))
}

function parseMarkdownTable(section: string): MarkdownTable | null {
  const lines = section
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    return null
  }

  if (!lines[0]?.includes("|") || !isTableDivider(lines[1] ?? "")) {
    return null
  }

  const headers = parseTableRow(lines[0] ?? "")
  const rows = lines
    .slice(2)
    .filter((line) => line.includes("|"))
    .map((line) => parseTableRow(line))

  if (headers.length === 0) {
    return null
  }

  return { headers, rows }
}

function renderParagraph(section: string, index: number) {
  const lines = section.split("\n")

  return (
    <p key={`p-${index}`} className="text-sm leading-7 text-muted-foreground">
      {lines.map((line, lineIndex) => (
        <Fragment key={`line-${index}-${lineIndex}`}>
          {renderInlineText(line, `inline-${index}-${lineIndex}`)}
          {lineIndex < lines.length - 1 ? <br /> : null}
        </Fragment>
      ))}
    </p>
  )
}

export function renderMarkdownTextBlock(content: string, options?: RenderMarkdownTextBlockOptions) {
  const sections = content
    .split(/\n{2,}/)
    .map((section) => section.trim())
    .filter(Boolean)

  return sections.map((section, index) => {
    const customDataTable = renderDataTableSection(section, `datatable-${index}`)

    if (customDataTable) {
      return customDataTable
    }

    const heading = resolveSectionHeading(section)

    if (heading && heading.level === 3) {
      const headingId = options?.resolveHeadingId?.(heading.title)

      return (
        <h3
          id={headingId}
          key={`h3-${index}`}
          className="scroll-mt-24 text-lg font-semibold tracking-tight text-foreground"
        >
          {renderInlineText(heading.title, `h3-${index}`)}
        </h3>
      )
    }

    if (heading && heading.level === 2) {
      const headingId = options?.resolveHeadingId?.(heading.title)

      return (
        <h2
          id={headingId}
          key={`h2-${index}`}
          className="scroll-mt-24 pt-2 text-2xl font-semibold tracking-tight text-foreground"
        >
          {renderInlineText(heading.title, `h2-${index}`)}
        </h2>
      )
    }

    if (heading && heading.level === 1) {
      const headingId = options?.resolveHeadingId?.(heading.title)

      return (
        <h1
          id={headingId}
          key={`h1-${index}`}
          className="scroll-mt-24 text-2xl font-semibold tracking-tight text-foreground"
        >
          {renderInlineText(heading.title, `h1-${index}`)}
        </h1>
      )
    }

    const normalizedLines = section
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)

    const table = parseMarkdownTable(section)
    if (table) {
      return (
        <div key={`table-${index}`} className="overflow-x-auto rounded-lg border border-border/60">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-muted/40">
              <tr>
                {table.headers.map((header, headerIndex) => (
                  <th
                    key={`head-${index}-${headerIndex}`}
                    className="px-4 py-3 font-semibold text-foreground"
                  >
                    {renderInlineText(header, `head-inline-${index}-${headerIndex}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rowIndex) => (
                <tr key={`row-${index}-${rowIndex}`} className="border-t border-border/60">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={`cell-${index}-${rowIndex}-${cellIndex}`}
                      className="px-4 py-3 text-muted-foreground"
                    >
                      {renderInlineText(cell, `cell-inline-${index}-${rowIndex}-${cellIndex}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (normalizedLines.length > 0 && normalizedLines.every((line) => line.startsWith("> "))) {
      return (
        <blockquote
          key={`blockquote-${index}`}
          className="border-l-2 border-border pl-4 text-sm leading-7 text-muted-foreground"
        >
          {normalizedLines.map((line, lineIndex) => (
            <Fragment key={`blockquote-line-${index}-${lineIndex}`}>
              {renderInlineText(line.slice(2).trim(), `blockquote-inline-${index}-${lineIndex}`)}
              {lineIndex < normalizedLines.length - 1 ? <br /> : null}
            </Fragment>
          ))}
        </blockquote>
      )
    }

    const unorderedListItems = normalizedLines
      .filter((line) => line.startsWith("- "))
      .map((line) => line.slice(2).trim())

    if (unorderedListItems.length > 0 && unorderedListItems.length === normalizedLines.length) {
      return (
        <ul key={`ul-${index}`} className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          {unorderedListItems.map((item) => (
            <li key={`${index}-${item}`}>{renderInlineText(item, `ul-inline-${index}-${item}`)}</li>
          ))}
        </ul>
      )
    }

    const orderedListItems = normalizedLines
      .map((line) => line.match(/^\d+\.\s+(.+)$/))
      .filter((match): match is RegExpMatchArray => match !== null)
      .map((match) => match[1] ?? "")

    if (orderedListItems.length > 0 && orderedListItems.length === normalizedLines.length) {
      return (
        <ol
          key={`ol-${index}`}
          className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground"
        >
          {orderedListItems.map((item, itemIndex) => (
            <li key={`${index}-ol-${itemIndex}`}>
              {renderInlineText(item, `ol-inline-${index}-${itemIndex}`)}
            </li>
          ))}
        </ol>
      )
    }

    return renderParagraph(section, index)
  })
}
