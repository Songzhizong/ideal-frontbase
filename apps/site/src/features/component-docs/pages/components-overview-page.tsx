import { BookMarked, ChevronRight } from "lucide-react"
import { COMPONENT_DOCS } from "@/features/component-docs/data/component-docs"
import { ComponentDocContentLayout } from "@/features/component-docs/layout/component-doc-content-layout"
import { BaseLink } from "@/packages/platform-router"
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/ui"

export function ComponentsOverviewPage() {
  return (
    <ComponentDocContentLayout
      title="组件目录与使用说明"
      description="文档结构采用“总览 + 组件详情”模式。每个组件独立维护文档条目，便于后续 AIAgent 自动化生成或更新。"
      actions={
        <Badge variant="secondary" className="w-fit">
          组件文档
        </Badge>
      }
    >
      <section className="grid gap-4 md:grid-cols-2">
        {COMPONENT_DOCS.map((doc) => (
          <BaseLink
            key={doc.slug}
            to={`/components/${doc.slug}`}
            className="group block h-full cursor-pointer"
          >
            <Card className="h-full border-border/60 bg-card/80 transition-colors group-hover:border-primary/40">
              <CardHeader>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <BookMarked className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <CardTitle>{doc.name}</CardTitle>
                  </div>
                  <Badge variant={doc.status === "stable" ? "secondary" : "outline"}>
                    {doc.status === "stable" ? "Stable" : "Beta"}
                  </Badge>
                </div>
                <CardDescription>{doc.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>分类：{doc.category}</p>
                <p className="font-code">源码：{doc.docsPath}</p>
                <p className="inline-flex items-center gap-1 font-medium text-primary">
                  查看详情
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </p>
              </CardContent>
            </Card>
          </BaseLink>
        ))}
      </section>
    </ComponentDocContentLayout>
  )
}
