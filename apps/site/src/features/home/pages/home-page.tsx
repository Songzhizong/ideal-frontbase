import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Code2,
  Component,
  FileCode2,
  GitBranch,
  Layers,
  LayoutTemplate,
  Palette,
  Sparkles,
  Terminal,
} from "lucide-react"
import { BaseLink } from "@/packages/platform-router"
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Tag,
} from "@/packages/ui"
import { cn } from "@/packages/ui-utils"

// --- Data Models ---

interface FeatureItem {
  title: string
  description: string
  icon: LucideIcon
  className?: string
}

interface RoleGuide {
  role: string
  title: string
  description: string
  icon: LucideIcon
  to: string
  steps: string[]
  color: string
}

const TECH_STACK = [
  { name: "AI Context Optimized", icon: BrainCircuit },
  { name: "React 19", icon: Code2 },
  { name: "TypeScript Strict", icon: FileCode2 },
  { name: "Tailwind 4", icon: Palette },
  { name: "TanStack Router", icon: GitBranch },
]

const KEY_FEATURES: FeatureItem[] = [
  {
    title: "Context Friendly",
    description: "清晰的 Monorepo 边界与文件结构，大幅减少 Token 消耗，让 AI 更精准理解上下文。",
    icon: Layers,
    className: "md:col-span-2",
  },
  {
    title: "Type Safe & Hallucination Free",
    description: "严格的 TS 类型定义与 Lint 规则，让 AI 生成的代码一次通过，拒绝幻觉。",
    icon: Sparkles,
  },
  {
    title: "Standardized Patterns",
    description: "统一的设计系统与代码规范，让 AI 能够举一反三，快速生成符合团队标准的代码。",
    icon: Component,
  },
  {
    title: "Agentic Ready",
    description: "内置完善的任务清单 (Task) 与实现计划 (Plan) 模板，完美适配 Agentic 模式开发。",
    icon: Bot,
    className: "md:col-span-2",
  },
]

const ROLE_GUIDES: RoleGuide[] = [
  {
    role: "开发工程师",
    title: "构建可靠应用",
    description: "利用清晰的目录结构和类型系统，与 AI 结对编程，倍增开发效率。",
    icon: Terminal,
    to: "/engineering",
    color: "text-blue-500",
    steps: ["工程目录结构", "路由与生成器", "API 请求规范"],
  },
  {
    role: "设计师",
    title: "查阅视觉规范",
    description: "使用统一的色彩、字体和组件库，确保 AI 生成的界面符合产品体验。",
    icon: LayoutTemplate,
    to: "/design",
    color: "text-purple-500",
    steps: ["色彩系统", "字体与排版", "组件交互状态"],
  },
  {
    role: "维护者",
    title: "沉淀通用资产",
    description: "将业务组件抽离为公共 UI 库，为 AI 提供更多高质量的上下文素材。",
    icon: Component,
    to: "/components",
    color: "text-emerald-500",
    steps: ["创建新组件", "编写组件文档", "发布与版本管理"],
  },
]

// --- Components ---

function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background Gradients (System Theme) */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[20%] left-[20%] h-125 w-125 rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute top-[10%] right-[10%] h-100 w-100 rounded-full bg-accent/10 blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[30%] h-150 w-150 rounded-full bg-secondary/10 blur-[120px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-sm font-medium text-primary">AI Native Engineering</span>
        </div>

        <h1 className="mx-auto mb-6 max-w-5xl text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl">
          Happy Coding with AI!
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          专为人工协作与 AI Agent 共生打造的工程模板。
          <br className="hidden sm:inline" />
          清晰的边界、语义化的 Token 与标准化的代码结构，让 AI 读得懂、改得对。
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            asChild
            className="h-12 rounded-full px-8 text-base shadow-lg shadow-primary/20"
          >
            <BaseLink to="/engineering">
              Start Coding with AI <Bot className="ml-2 h-4 w-4" />
            </BaseLink>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="h-12 rounded-full border-border/50 bg-background/50 px-8 text-base backdrop-blur-sm hover:bg-accent/50"
          >
            <BaseLink to="/components">浏览组件库</BaseLink>
          </Button>
        </div>

        {/* Tech Stack Pills */}
        <div className="mt-16 flex flex-wrap justify-center gap-4 opacity-90 md:gap-8">
          {TECH_STACK.map((tech) => (
            <div
              key={tech.name}
              className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <tech.icon className="h-5 w-5" />
              <span className="font-medium">{tech.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturesGrid() {
  return (
    <section className="container mx-auto px-4 py-16 lg:py-24">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">为 Agentic 时代而生</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          不仅仅是代码模板，更是 AI 友好的知识库与执行标准。
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        {KEY_FEATURES.map((feature) => (
          <Card
            key={feature.title}
            className={cn(
              "group relative overflow-hidden border-border/50 bg-card/40 transition-all hover:bg-card/80 hover:shadow-lg",
              feature.className,
            )}
          >
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/5 blur-3xl transition-all group-hover:bg-primary/10" />

            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

function GettingStarted() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">人机协作的最佳实践</h2>
            <p className="mt-2 text-lg text-muted-foreground">
              无论你是人类开发者还是 AI Agent，这里都有最高效的路径。
            </p>
          </div>
          <Button variant="ghost" className="hidden gap-2 md:inline-flex" asChild>
            <BaseLink to="/engineering">
              查看完整文档 <ChevronRight className="h-4 w-4" />
            </BaseLink>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {ROLE_GUIDES.map((guide) => (
            <div key={guide.role} className="group relative">
              <BaseLink to={guide.to} className="block h-full">
                <Card className="h-full border-border/50 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Tag
                        variant="solid"
                        color="secondary"
                        className="bg-background/80 backdrop-blur-sm"
                      >
                        {guide.role}
                      </Tag>
                      <guide.icon className={cn("h-6 w-6 transition-colors", guide.color)} />
                    </div>
                    <CardTitle className="mt-4 text-xl">{guide.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{guide.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {guide.steps.map((step) => (
                        <li
                          key={step}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle2 className="h-4 w-4 text-primary/60" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <div className="absolute bottom-4 right-4 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                    <ArrowRight className="h-5 w-5 text-primary" />
                  </div>
                </Card>
              </BaseLink>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CommunityCTA() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-b from-primary/5 to-transparent px-6 py-16 text-center md:px-12 md:py-20 shadow-2xl">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-accent text-primary-foreground shadow-lg">
              <Bot className="h-8 w-8" />
            </div>
          </div>

          <h2 className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl">
            准备好进入 AI 编程时代了吗？
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
            加入 Ideal Frontbase，体验 AI Native 工程化带来的效率革命。
            <br />
            我们提供完整的上下文支持，让你的 Copilot 更好用。
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="rounded-full px-8">
              <BaseLink to="/engineering">阅读开发文档</BaseLink>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-full px-8">
              <a
                href="https://github.com/Songzhizong/ideal-frontbase"
                target="_blank"
                rel="noreferrer"
              >
                Github 仓库
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection />
      <Separator className="bg-border/30" />
      <FeaturesGrid />
      <Separator className="bg-border/30" />
      <GettingStarted />
      <Separator className="bg-border/30" />
      <CommunityCTA />
    </div>
  )
}
