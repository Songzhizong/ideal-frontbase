import { Palette, Sparkles, SquareStack } from "lucide-react"
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/packages/ui"

interface DesignRule {
  title: string
  description: string
  icon: typeof Palette
}

const DESIGN_RULES: readonly DesignRule[] = [
  {
    title: "页面骨架统一",
    description: "首页、列表、详情页采用一致的区块组织方式，降低页面维护成本。",
    icon: SquareStack,
  },
  {
    title: "语义化视觉令牌",
    description: "使用 theme-system 与语义化色彩变量，避免业务页面出现硬编码颜色。",
    icon: Palette,
  },
  {
    title: "交互反馈一致",
    description: "按钮、卡片、导航项统一 hover/focus 反馈，保证体验连贯。",
    icon: Sparkles,
  },
]

export function DesignPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <Badge variant="secondary" className="w-fit">
          设计
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          设计系统与页面规范
        </h1>
        <p className="max-w-3xl text-base leading-7 text-muted-foreground">
          从视觉令牌到页面结构，这里沉淀了团队在模板工程中约定的设计基线，确保各应用体验一致。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {DESIGN_RULES.map((rule) => {
          const Icon = rule.icon
          return (
            <Card key={rule.title} className="border-border/60 bg-card/80">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <CardTitle>{rule.title}</CardTitle>
                <CardDescription>{rule.description}</CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle>页面模板建议</CardTitle>
            <CardDescription>
              建议按“信息概览 - 关键操作 - 详情内容”三段结构组织页面。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>1. 顶部展示页面意图与关键入口。</p>
            <p>2. 中部通过卡片/表格承载核心业务信息。</p>
            <p>3. 底部补充说明、帮助信息或关联操作。</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle>视觉实施建议</CardTitle>
            <CardDescription>优先使用 `@ideal-frontbase/ui` 组件，减少样式漂移。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>1. 布局边界使用 `border-border/50` 构建轻量分割。</p>
            <p>2. 状态反馈依靠语义色，不以单一颜色表达含义。</p>
            <p>3. 复杂模块通过组合组件封装，不直接修改底层 shadcn 组件。</p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
