import { describe, expect, it } from "vitest"
import { renderDataTableSection } from "@/features/component-docs/components/markdown-data-table"

describe("renderDataTableSection", () => {
  it("should parse object literal rows without evaluating code", () => {
    const section = `<DataTable preset="props" :data="[
  {
    name: 'variant',
    type: 'ButtonVariant',
    default: \`'solid'\`,
    description: '按钮语义样式。',
    required: true,
  }
]"/>`

    const result = renderDataTableSection(section, "table-safe")
    expect(result).not.toBeNull()
  })

  it("should reject executable expressions", () => {
    const globalRef = globalThis as {
      __COMPONENT_DOCS_ATTACK__?: number
    }
    globalRef.__COMPONENT_DOCS_ATTACK__ = 0

    const section = `<DataTable :data="[globalThis.__COMPONENT_DOCS_ATTACK__ = 1]"/>`
    const result = renderDataTableSection(section, "table-unsafe")

    expect(result).toBeNull()
    expect(globalRef.__COMPONENT_DOCS_ATTACK__).toBe(0)
  })

  it("should parse data rows when row strings contain double quotes", () => {
    const section = `<DataTable preset="props" :data="[
  {
    name: 'size',
    type: 'ButtonProps["size"]',
    default: '-',
    description: '按钮尺寸。',
  }
]"/>`

    const result = renderDataTableSection(section, "table-nested-quotes")
    expect(result).not.toBeNull()
  })
})
