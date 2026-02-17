const markdownDocModules = import.meta.glob<string>("./zh-CN/components/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
})

function toMarkdownEntryKey(modulePath: string) {
  const match = modulePath.match(/^\.\/zh-CN\/components\/(.+)\.md$/)
  return match?.[1] ?? null
}

const markdownDocEntries = Object.keys(markdownDocModules)
  .map(toMarkdownEntryKey)
  .filter((entry): entry is string => entry !== null)

export function listMarkdownDocEntries() {
  return markdownDocEntries
}

export function getMarkdownDocContent(entry: string) {
  const key = `./zh-CN/components/${entry}.md`

  return markdownDocModules[key] ?? null
}
