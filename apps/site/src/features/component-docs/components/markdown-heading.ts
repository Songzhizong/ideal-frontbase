export type MarkdownHeadingLevel = 1 | 2 | 3

export interface MarkdownHeading {
  id: string
  level: MarkdownHeadingLevel
  text: string
}

export function stripInlineFormat(input: string) {
  return input
    .replaceAll(/`([^`]+)`/g, "$1")
    .replaceAll(/\*\*([^*]+)\*\*/g, "$1")
    .trim()
}

function toHeadingSlug(text: string) {
  const base = stripInlineFormat(text)
    .toLowerCase()
    .replaceAll(/[^\p{Letter}\p{Number}\u4e00-\u9fa5\s-]/gu, "")
    .replaceAll(/\s+/g, "-")
    .replaceAll(/-+/g, "-")
    .replaceAll(/^-|-$/g, "")

  return base.length > 0 ? base : "section"
}

export function createHeadingIdResolver() {
  const slugCountMap = new Map<string, number>()

  return (text: string) => {
    const baseSlug = toHeadingSlug(text)
    const currentCount = slugCountMap.get(baseSlug) ?? 0
    const nextCount = currentCount + 1
    slugCountMap.set(baseSlug, nextCount)

    if (nextCount === 1) {
      return baseSlug
    }

    return `${baseSlug}-${nextCount}`
  }
}
