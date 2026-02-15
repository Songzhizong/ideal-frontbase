import { AlertTriangle, BookOpenCheck } from "lucide-react"
import { DocPageToc } from "@/features/component-docs/components/doc-page-toc"
import { MarkdownDocRenderer } from "@/features/component-docs/components/markdown-doc-renderer"
import { extractMarkdownHeadings } from "@/features/component-docs/components/markdown-doc-renderer.utils"
import { findComponentDocBySlug } from "@/features/component-docs/data/component-docs"
import { ComponentDocContentLayout } from "@/features/component-docs/layout/component-doc-content-layout"
import { getMarkdownDocContent } from "@/features/component-docs/markdown/markdown-doc-registry"
import { BaseLink } from "@/packages/platform-router"
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

  const markdownContent = doc.markdownEntry ? getMarkdownDocContent(doc.markdownEntry) : null
  const markdownHeadings = markdownContent ? extractMarkdownHeadings(markdownContent) : []
  const renderMode = doc.renderMode ?? "hybrid"
  const isMarkdownOnly = renderMode === "markdown-only"

  return (
    <ComponentDocContentLayout
      title={doc.name}
      description={isMarkdownOnly ? undefined : doc.summary}
      actions={
        <>
          <Badge variant="secondary">{doc.category}</Badge>
          <Badge variant={doc.status === "stable" ? "secondary" : "outline"}>
            {doc.status === "stable" ? "Stable" : "Beta"}
          </Badge>
        </>
      }
    >
      {isMarkdownOnly ? null : (
        <p className="font-code text-xs text-muted-foreground">源码位置：{doc.docsPath}</p>
      )}
      {doc.renderDetail ? (
        doc.renderDetail(doc)
      ) : isMarkdownOnly ? (
        markdownContent ? (
          <div className="grid gap-6 pb-16 xl:grid-cols-[minmax(0,1fr)_220px]">
            <div className="min-w-0 max-w-4xl space-y-12">
              <MarkdownDocRenderer
                content={markdownContent}
                component={doc.markdownEntry ?? doc.slug}
                headings={markdownHeadings}
              />
            </div>
            <div className="hidden xl:block">
              <div className="sticky top-4 max-h-[calc(100vh-1rem)] overflow-y-auto">
                <DocPageToc headings={markdownHeadings} />
              </div>
            </div>
          </div>
        ) : (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardHeader>
              <CardTitle>Markdown 文档缺失</CardTitle>
              <CardDescription>
                当前组件已配置为 markdown-only，但未找到对应 Markdown 文件。
              </CardDescription>
            </CardHeader>
          </Card>
        )
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
                <p>{doc.usage}</p>
                {doc.notes.map((note) => (
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
                {doc.scenarios.map((scenario, index) => (
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
                  {doc.api.map((item) => (
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
