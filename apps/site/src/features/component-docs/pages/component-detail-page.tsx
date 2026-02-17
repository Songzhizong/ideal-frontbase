import { AlertTriangle, BookOpenCheck } from "lucide-react"
import { DocPageToc } from "@/features/component-docs/components/doc-page-toc"
import { MarkdownDocRenderer } from "@/features/component-docs/components/markdown-doc-renderer"
import { extractMarkdownHeadings } from "@/features/component-docs/components/markdown-parsing"
import { findComponentDocBySlug } from "@/features/component-docs/data/component-docs"
import { isMarkdownOnlyComponentDoc } from "@/features/component-docs/data/types"
import { ComponentDocContentLayout } from "@/features/component-docs/layout/component-doc-content-layout"
import { getMarkdownDocContent } from "@/features/component-docs/markdown/markdown-doc-registry"
import { BaseLink } from "@/packages/platform-router"
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tag,
} from "@/packages/ui"

interface ComponentDetailPageProps {
  componentSlug: string
}

export function ComponentDetailPage({ componentSlug }: ComponentDetailPageProps) {
  const doc = findComponentDocBySlug(componentSlug)

  if (!doc) {
    return (
      <ComponentDocContentLayout
        title="未找到组件文档"
        description="当前组件标识不存在，请从左侧目录选择有效组件。"
      >
        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </div>
            <CardTitle>组件文档不存在</CardTitle>
            <CardDescription>请确认 URL 中的组件标识是否正确。</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <BaseLink to="/components">返回组件总览</BaseLink>
            </Button>
          </CardContent>
        </Card>
      </ComponentDocContentLayout>
    )
  }

  const markdownEntry = doc.markdownEntry
  const markdownContent = markdownEntry ? getMarkdownDocContent(markdownEntry) : null
  const markdownHeadings = markdownContent ? extractMarkdownHeadings(markdownContent) : []
  const shouldRenderMarkdownOnly = isMarkdownOnlyComponentDoc(doc) && markdownContent !== null
  const usage = doc.usage ?? "当前组件文档正在建设中，请先结合源码完成接入。"
  const notes = doc.notes ?? ["当前组件文档正在完善中，后续会补齐最佳实践。"]
  const scenarios = doc.scenarios ?? ["基础渲染", "业务页面集成"]
  const api = doc.api ?? [
    {
      name: "待补充",
      type: "-",
      defaultValue: "-",
      description: "该组件 API 将在后续文档迭代中补充。",
    },
  ]

  return (
    <ComponentDocContentLayout
      title={doc.name}
      description={shouldRenderMarkdownOnly ? undefined : doc.summary}
      actions={
        <>
          <Tag variant="solid" color="secondary">
            {doc.category}
          </Tag>
          <Tag
            variant={doc.status === "stable" ? "solid" : "outline"}
            color={doc.status === "stable" ? "secondary" : "primary"}
          >
            {doc.status === "stable" ? "Stable" : "Beta"}
          </Tag>
        </>
      }
    >
      {shouldRenderMarkdownOnly ? null : (
        <p className="font-code text-xs text-muted-foreground">源码位置：{doc.docsPath}</p>
      )}
      {doc.renderDetail ? (
        doc.renderDetail(doc)
      ) : shouldRenderMarkdownOnly ? (
        markdownContent ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_220px]">
            <div className="min-w-0 max-w-4xl space-y-12">
              <MarkdownDocRenderer
                content={markdownContent}
                component={doc.markdownEntry ?? doc.slug}
              />
            </div>
            <div className="hidden xl:block">
              <div className="sticky top-4 max-h-[calc(100vh-1rem)] overflow-y-auto">
                <DocPageToc headings={markdownHeadings} />
              </div>
            </div>
          </div>
        ) : null
      ) : (
        <>
          {markdownContent ? (
            <MarkdownDocRenderer
              content={markdownContent}
              component={doc.markdownEntry ?? doc.slug}
              className="rounded-2xl border border-border/70 bg-card/75 p-6 md:p-8"
            />
          ) : null}

          <section className="grid gap-4 xl:grid-cols-2">
            <Card className="border-border/60 bg-card/80">
              <CardHeader>
                <CardTitle>使用建议</CardTitle>
                <CardDescription>优先遵循规范化的组件组合方式。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
                <p>{usage}</p>
                {notes.map((note) => (
                  <p key={note}>- {note}</p>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card/80">
              <CardHeader>
                <CardTitle>典型场景</CardTitle>
                <CardDescription>业务落地时的优先使用场景。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground">
                {scenarios.map((scenario, index) => (
                  <p key={scenario}>
                    {index + 1}. {scenario}
                  </p>
                ))}
              </CardContent>
            </Card>
          </section>

          <section className="rounded-2xl border border-border/70 bg-card/75 p-6 md:p-8">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
              </span>
              <h2 className="text-xl font-semibold tracking-tight">核心 API</h2>
            </div>
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 font-semibold">属性</th>
                    <th className="px-4 py-3 font-semibold">类型</th>
                    <th className="px-4 py-3 font-semibold">默认值</th>
                    <th className="px-4 py-3 font-semibold">说明</th>
                  </tr>
                </thead>
                <tbody>
                  {api.map((item) => (
                    <tr key={item.name} className="border-t border-border/60">
                      <td className="font-code px-4 py-3">{item.name}</td>
                      <td className="font-code px-4 py-3 text-muted-foreground">{item.type}</td>
                      <td className="font-code px-4 py-3 text-muted-foreground">
                        {item.defaultValue}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </ComponentDocContentLayout>
  )
}
