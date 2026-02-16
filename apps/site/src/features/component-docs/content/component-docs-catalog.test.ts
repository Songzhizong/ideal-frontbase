import { describe, expect, it } from "vitest"
import {
  DEFAULT_COMPONENT_DOCS,
  UI_EXPORT_COMPONENT_SLUGS,
} from "@/features/component-docs/content/component-docs-catalog"

describe("DEFAULT_COMPONENT_DOCS", () => {
  it("should cover all exported component slugs without duplicates", () => {
    const slugs = DEFAULT_COMPONENT_DOCS.map((doc) => doc.slug)
    const uniqueSlugs = new Set(slugs)

    expect(uniqueSlugs.size).toBe(slugs.length)
    expect(slugs.length).toBe(UI_EXPORT_COMPONENT_SLUGS.length)
    expect(slugs).toEqual(expect.arrayContaining([...UI_EXPORT_COMPONENT_SLUGS]))
  })
})
