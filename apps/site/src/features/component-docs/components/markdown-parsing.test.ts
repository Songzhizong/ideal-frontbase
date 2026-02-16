import { describe, expect, it } from "vitest"
import {
  extractMarkdownHeadings,
  splitMarkdownBlocks,
} from "@/features/component-docs/components/markdown-parsing"

describe("splitMarkdownBlocks", () => {
  it("should keep text、playground、code block boundaries", () => {
    const content = `
## 概览

\`\`\`playground
basic
state-default
\`\`\`

### 实现

\`\`\`tsx
export function Demo() {
  return <div />
}
\`\`\`
`.trim()

    const blocks = splitMarkdownBlocks(content)

    expect(blocks).toEqual([
      {
        type: "text",
        content: "## 概览",
      },
      {
        type: "playground",
        files: ["basic", "state-default"],
      },
      {
        type: "text",
        content: "### 实现",
      },
      {
        type: "code",
        language: "tsx",
        content: "export function Demo() {\n  return <div />\n}",
      },
    ])
  })
})

describe("extractMarkdownHeadings", () => {
  it("should generate stable heading ids and ignore code block headings", () => {
    const content = `
## API

\`\`\`md
## 不应被识别
\`\`\`

## API

### 事件
`.trim()

    expect(extractMarkdownHeadings(content)).toEqual([
      {
        id: "api",
        level: 2,
        text: "API",
      },
      {
        id: "api-2",
        level: 2,
        text: "API",
      },
      {
        id: "事件",
        level: 3,
        text: "事件",
      },
    ])
  })
})
