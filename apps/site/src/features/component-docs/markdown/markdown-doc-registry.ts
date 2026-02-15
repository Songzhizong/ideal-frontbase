const markdownDocModules = import.meta.glob<string>("./zh-CN/components/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
})

export function getMarkdownDocContent(entry: string) {
  const key = `./zh-CN/components/${entry}.md`

  return markdownDocModules[key] ?? null
}
