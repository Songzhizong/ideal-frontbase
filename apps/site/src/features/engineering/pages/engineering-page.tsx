import { Card, CardContent, CardDescription, CardHeader, CardTitle, Tag } from "@/packages/ui"

const ENGINEERING_BLOCKS = [
  {
    title: "应用目录",
    description: "所有业务应用统一放在 apps/*，应用间禁止直接互相导入源码。",
    content: "跨应用复用必须下沉到 packages/*，保证边界清晰与依赖可控。",
  },
  {
    title: "路由与导航",
    description: "使用 TanStack Router 文件路由，站内跳转统一 BaseLink/useBaseNavigate。",
    content: "禁止 window.location 和硬编码 <a href='/...'> 内链，避免子路径部署问题。",
  },
  {
    title: "数据与请求",
    description: "HTTP 客户端统一使用 ky，结合 TanStack Query 组织缓存与状态。",
    content: "对外 API 调用集中在 packages/api-core，业务层只消费稳定接口。",
  },
  {
    title: "质量门禁",
    description: "提交前执行 lint/typecheck/test，保证模板工程质量基线。",
    content: "格式与代码规范使用 Biome，避免风格分裂。",
  },
] as const

export function EngineeringPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <Tag variant="solid" color="secondary" className="w-fit">
          研发
        </Tag>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          研发规范与工程实践
        </h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground">
          这个页面聚焦模板工程的落地方式，帮助团队在不同业务应用中保持一致的研发体验。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {ENGINEERING_BLOCKS.map((block) => (
          <Card key={block.title} className="border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle>{block.title}</CardTitle>
              <CardDescription>{block.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">
              {block.content}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="rounded-2xl border border-border/70 bg-card/70 p-6 md:p-8">
        <h2 className="text-xl font-semibold tracking-tight">推荐研发流程</h2>
        <div className="mt-4 grid gap-3 text-sm leading-6 text-muted-foreground">
          <p>1. 从 `apps/site` 的页面模板复制结构，快速建立业务页面骨架。</p>
          <p>2. 将可复用逻辑沉淀到 `packages/*`，再由应用按需组合。</p>
          <p>3. 提交前执行 `pnpm lint` 与 `pnpm typecheck`，确保变更可合并。</p>
        </div>
      </section>
    </div>
  )
}
