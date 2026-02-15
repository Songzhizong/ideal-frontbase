import {
  AlertTriangle,
  Ban,
  ChevronRight,
  Circle,
  Code2,
  ExternalLink,
  LoaderCircle,
  Minus,
  MousePointer2,
  Pause,
  Plus,
  SkipBack,
  SkipForward,
} from "lucide-react"
import { type ReactNode, useState } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"
import type { ComponentDoc } from "@/features/component-docs/data/types"
import { useResolvedTheme } from "@/packages/theme-system"

import {
  Button,
  ButtonGroup,
  ButtonIcon,
  ButtonLink,
  ButtonLoading,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  CopyButton,
  Separator,
} from "@/packages/ui"
import { cn } from "@/packages/ui-utils"

const COLOR_DEMO_CODE = `import { Button } from "@/packages/ui"

const colors = ["primary", "destructive", "success", "warning", "info", "carbon", "secondary", "accent"] as const

export function ButtonColorDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {colors.map((color) => (
        <Button key={color} color={color}>
          {color}
        </Button>
      ))}
    </div>
  )
}`

const VARIANT_DEMO_CODE = `import { Button } from "@/packages/ui"

const variants = ["solid", "outline", "dashed", "soft", "ghost", "link", "plain", "pure"] as const

export function ButtonVariantDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {variants.map((variant) => (
        <Button key={variant} color="destructive" variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  )
}`

const SIZE_DEMO_CODE = `import { Button } from "@/packages/ui"

const sizes = ["xs", "sm", "md", "lg", "xl", "2xl"] as const

export function ButtonSizeDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {sizes.map((size) => (
        <Button key={size} size={size} variant="pure" color="success">
          {size}
        </Button>
      ))}
    </div>
  )
}`

const SHAPE_DEMO_CODE = `import { Minus, Plus } from "lucide-react"
import { Button, ButtonIcon } from "@/packages/ui"

export function ButtonShapeDemo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button shape="rounded">rounded</Button>
      <ButtonIcon icon={<Minus className="size-4" />} variant="plain" color="destructive" shape="square" />
      <ButtonIcon icon={<Plus className="size-4" />} variant="outline" color="success" shape="circle" />
      <ButtonIcon icon={<Plus className="size-4" />} variant="dashed" color="warning" shape="square" />
      <ButtonIcon icon={<Minus className="size-4" />} shape="circle" />
    </div>
  )
}`

const SHADOW_DEMO_CODE = `import { Button } from "@/packages/ui"

const shadows = ["none", "sm", "md", "lg"] as const

export function ButtonShadowDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {shadows.map((shadow) => (
        <Button key={shadow} variant="pure" shadow={shadow}>
          {shadow}
        </Button>
      ))}
    </div>
  )
}`

const SLOT_DEMO_CODE = `import { Minus, Plus } from "lucide-react"
import { Button } from "@/packages/ui"

export function ButtonSlotDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button color="primary" leading={<Plus className="size-4" />}>
        leading
      </Button>
      <Button color="destructive" variant="outline" trailing={<Minus className="size-4" />}>
        trailing
      </Button>
      <Button
        color="success"
        variant="dashed"
        leading={<Plus className="size-4" />}
        trailing={<Minus className="size-4" />}
      >
        both
      </Button>
    </div>
  )
}`

const DISABLED_DEMO_CODE = `import { Button } from "@/packages/ui"

export function ButtonDisabledDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button disabled>Disabled</Button>
    </div>
  )
}`

const LOADING_DEMO_CODE = `import { useState } from "react"
import { Button, ButtonLoading } from "@/packages/ui"

export function ButtonLoadingDemo() {
  const [loading, setLoading] = useState(false)

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <ButtonLoading variant="pure" autoLoading loadingDuration={1000}>
          Loading Start
        </ButtonLoading>
        <ButtonLoading variant="outline" loadingText="Loading..." loadingPosition="center" autoLoading loadingDuration={1000}>
          Loading Center
        </ButtonLoading>
        <ButtonLoading variant="soft" loadingPosition="end" autoLoading loadingDuration={1000}>
          Loading End
        </ButtonLoading>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <ButtonLoading color="accent" loading={loading} onClick={() => setLoading(true)}>
          Controlled Loading
        </ButtonLoading>
        <Button color="destructive" disabled={!loading} onClick={() => setLoading(false)}>
          End Loading
        </Button>
      </div>
    </div>
  )
}`

const ICON_DEMO_CODE = `import { Pause, SkipBack, SkipForward } from "lucide-react"
import { ButtonIcon } from "@/packages/ui"

export function ButtonIconDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <ButtonIcon icon={<SkipBack className="size-4" />} />
      <ButtonIcon icon={<SkipForward className="size-4" />} />
      <ButtonIcon icon={<Pause className="size-4" />} />
    </div>
  )
}`

const LINK_DEMO_CODE = `import { ButtonLink } from "@/packages/ui"

export function ButtonLinkDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <ButtonLink to="/component-docs/button">站内链接</ButtonLink>
      <ButtonLink to="/component-docs/button" target="_blank">新标签页打开</ButtonLink>
      <ButtonLink to="/component-docs/button" disabled>禁用链接</ButtonLink>
      <ButtonLink href="https://soybeanjs.cn">外部链接</ButtonLink>
    </div>
  )
}`

const GROUP_DEMO_CODE = `import { Button, ButtonGroup } from "@/packages/ui"

export function ButtonGroupDemo() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      <ButtonGroup variant="pure" color="accent" className="whitespace-nowrap">
        <Button>Button 1</Button>
        <Button>Button 2</Button>
        <Button>Button 3</Button>
      </ButtonGroup>
      <ButtonGroup orientation="vertical" variant="outline" color="warning" className="w-32">
        <Button>Button 1</Button>
        <Button>Button 2</Button>
        <Button>Button 3</Button>
      </ButtonGroup>
    </div>
  )
}`

const BUTTON_COLORS = [
  "primary",
  "destructive",
  "success",
  "warning",
  "info",
  "carbon",
  "secondary",
  "accent",
] as const
const BUTTON_VARIANTS = [
  "solid",
  "outline",
  "dashed",
  "soft",
  "ghost",
  "link",
  "plain",
  "pure",
] as const
const BUTTON_SIZES = ["xs", "sm", "md", "lg", "xl", "2xl"] as const
const BUTTON_SHADOWS = ["none", "sm", "md", "lg"] as const

interface DocSectionProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
}

function DocSection({ title, description, children, className }: DocSectionProps) {
  return (
    <section className={cn("space-y-6", className)}>
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
        {description && <p className="text-base text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  )
}

interface DemoBlockProps {
  title: string
  description: string
  code: string
  children: ReactNode
}

function DemoBlock({ title, description, code, children }: DemoBlockProps) {
  const [isOpen, setIsOpen] = useState(false)
  const resolvedTheme = useResolvedTheme()
  const isDark = resolvedTheme === "dark"
  const codeFontFamily = '"JetBrains Mono", "SFMono-Regular", Menlo, Monaco, Consolas, monospace'

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="group overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm"
    >
      <div className="border-b border-border p-6">
        <div className="flex items-start justify-between gap-3 pb-4">
          <div className="space-y-1">
            <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 gap-2 text-muted-foreground hover:text-foreground"
            >
              <Code2 className="h-4 w-4" />
              {isOpen ? "收起代码" : "查看代码"}
              <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")} />
            </Button>
          </CollapsibleTrigger>
        </div>
        <div className="flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-border/60 bg-background/50 p-8">
          {children}
        </div>
      </div>
      <CollapsibleContent>
        <div className="relative overflow-hidden border-t border-border/70">
          <CopyButton
            value={code}
            variant="ghost"
            size="icon-sm"
            iconOnly
            className="absolute right-3 top-3 z-10 h-7 w-7 border border-border/60 bg-background/75 text-muted-foreground backdrop-blur-sm hover:bg-background hover:text-foreground"
          />
          <SyntaxHighlighter
            language="tsx"
            style={isDark ? oneDark : oneLight}
            customStyle={{
              margin: 0,
              padding: "1.25rem 3.25rem 1.25rem 1.25rem",
              fontSize: "0.875rem",
              lineHeight: "1.6",
              overflowX: "auto",
              tabSize: "2",
              fontFamily: codeFontFamily,
            }}
            codeTagProps={{
              style: {
                fontFamily: codeFontFamily,
                fontFeatureSettings: '"tnum" 1',
              },
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

interface ButtonDocDetailProps {
  doc: ComponentDoc
}

function ButtonDocDetail({ doc }: ButtonDocDetailProps) {
  const [controlledLoading, setControlledLoading] = useState(false)

  return (
    <div className="max-w-4xl space-y-12 pb-16">
      <DocSection
        title="何时使用"
        description="标记了一个（或封装一组）操作命令，响应用户点击行为，触发相应的业务逻辑。"
      >
        <div className="space-y-8 text-sm text-foreground/90">
          <div className="space-y-4">
            <p>在 Ideal Frontbase 中我们提供了五种按钮类型：</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Circle className="mt-0.5 h-4 w-4 fill-primary text-primary" />
                <span>
                  <strong className="font-medium text-foreground">主按钮 (Default)</strong>
                  ：用于主行动点，一个操作区域只能有一个主按钮。
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Circle className="mt-0.5 h-4 w-4 fill-muted text-muted" />
                <span>
                  <strong className="font-medium text-foreground">默认按钮 (Secondary)</strong>
                  ：用于没有主次之分的一组行动点。
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Circle className="mt-0.5 h-4 w-4 text-muted-foreground/60" />
                <span>
                  <strong className="font-medium text-foreground">虚线按钮 (Outline)</strong>
                  ：常用于添加操作或次级辅助操作。
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MousePointer2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <span>
                  <strong className="font-medium text-foreground">文本按钮 (Ghost)</strong>
                  ：用于最次级的行动点，或显性强调不够的场景。
                </span>
              </li>
              <li className="flex items-start gap-3">
                <ExternalLink className="mt-0.5 h-4 w-4 text-primary" />
                <span>
                  <strong className="font-medium text-foreground">链接按钮 (Link)</strong>
                  ：一般用于链接，即导航至某位置。
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <p>以及四种状态属性与上面配合使用：</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 fill-destructive/10 text-destructive" />
                <span>
                  <strong className="font-medium text-foreground">危险 (Destructive)</strong>
                  ：删除/移动/修改权限等危险操作，一般需要二次确认。
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Ban className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <span>
                  <strong className="font-medium text-foreground">禁用 (Disabled)</strong>
                  ：行动点不可用的时候，一般需要文案解释。
                </span>
              </li>
              <li className="flex items-start gap-3">
                <LoaderCircle className="mt-0.5 h-4 w-4 animate-spin text-primary" />
                <span>
                  <strong className="font-medium text-foreground">加载中 (Loading)</strong>
                  ：用于异步操作等待反馈的时候，也可以避免多次提交。
                </span>
              </li>
            </ul>
          </div>
        </div>
      </DocSection>

      <DocSection title="代码演示">
        <div className="grid gap-8">
          <DemoBlock
            title="颜色"
            description="支持 primary、destructive、success、warning、info、carbon、secondary、accent 八种语义色。"
            code={COLOR_DEMO_CODE}
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              {BUTTON_COLORS.map((color) => (
                <Button key={color} color={color}>
                  {color}
                </Button>
              ))}
            </div>
          </DemoBlock>

          <DemoBlock
            title="变体"
            description="支持 solid、outline、dashed、soft、ghost、link、plain、pure。"
            code={VARIANT_DEMO_CODE}
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              {BUTTON_VARIANTS.map((variant) => (
                <Button key={variant} variant={variant} color="destructive">
                  {variant}
                </Button>
              ))}
            </div>
          </DemoBlock>

          <DemoBlock
            title="尺寸"
            description="支持 xs、sm、md、lg、xl、2xl。"
            code={SIZE_DEMO_CODE}
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              {BUTTON_SIZES.map((size) => (
                <Button key={size} size={size} color="success" variant="pure">
                  {size}
                </Button>
              ))}
            </div>
          </DemoBlock>

          <DemoBlock
            title="形状"
            description="支持 auto、rounded、square、circle。"
            code={SHAPE_DEMO_CODE}
          >
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button shape="rounded">rounded</Button>
              <ButtonIcon
                icon={<Minus className="size-4" />}
                variant="plain"
                color="destructive"
                shape="square"
                aria-label="减号"
              />
              <ButtonIcon
                icon={<Plus className="size-4" />}
                variant="outline"
                color="success"
                shape="circle"
                aria-label="加号"
              />
              <ButtonIcon
                icon={<Plus className="size-4" />}
                variant="dashed"
                color="warning"
                shape="square"
                aria-label="添加"
              />
              <ButtonIcon icon={<Minus className="size-4" />} shape="circle" aria-label="移除" />
            </div>
          </DemoBlock>

          <DemoBlock title="阴影" description="支持 none、sm、md、lg。" code={SHADOW_DEMO_CODE}>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {BUTTON_SHADOWS.map((shadow) => (
                <Button key={shadow} variant="pure" shadow={shadow}>
                  {shadow}
                </Button>
              ))}
            </div>
          </DemoBlock>

          <DemoBlock
            title="内容插槽"
            description="通过 leading 与 trailing 渲染前后内容。"
            code={SLOT_DEMO_CODE}
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button color="primary" leading={<Plus className="size-4" />}>
                leading
              </Button>
              <Button color="destructive" variant="outline" trailing={<Minus className="size-4" />}>
                trailing
              </Button>
              <Button
                color="success"
                variant="dashed"
                leading={<Plus className="size-4" />}
                trailing={<Minus className="size-4" />}
              >
                both
              </Button>
            </div>
          </DemoBlock>

          <DemoBlock
            title="禁用"
            description="禁用状态会自动拦截交互行为。"
            code={DISABLED_DEMO_CODE}
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button disabled>Disabled</Button>
            </div>
          </DemoBlock>

          <DemoBlock
            title="加载"
            description="支持 start / center / end 三种加载位置，以及受控加载模式。"
            code={LOADING_DEMO_CODE}
          >
            <div className="grid w-full gap-4">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <ButtonLoading variant="pure" autoLoading loadingDuration={1000}>
                  Loading Start
                </ButtonLoading>
                <ButtonLoading
                  variant="outline"
                  loadingText="Loading..."
                  autoLoading
                  loadingDuration={1000}
                  loadingPosition="center"
                >
                  Loading Center
                </ButtonLoading>
                <ButtonLoading
                  variant="soft"
                  autoLoading
                  loadingDuration={1000}
                  loadingPosition="end"
                >
                  Loading End
                </ButtonLoading>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <ButtonLoading
                  color="accent"
                  variant="solid"
                  loading={controlledLoading}
                  onClick={() => setControlledLoading(true)}
                >
                  Controlled Loading
                </ButtonLoading>
                <Button
                  color="destructive"
                  variant="outline"
                  disabled={!controlledLoading}
                  onClick={() => setControlledLoading(false)}
                >
                  End Loading
                </Button>
              </div>
            </div>
          </DemoBlock>

          <DemoBlock
            title="图标按钮"
            description="ButtonIcon 适合紧凑操作场景。"
            code={ICON_DEMO_CODE}
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <ButtonIcon icon={<SkipBack className="size-4" />} aria-label="后退" />
              <ButtonIcon icon={<SkipForward className="size-4" />} aria-label="前进" />
              <ButtonIcon icon={<Pause className="size-4" />} aria-label="暂停" />
            </div>
          </DemoBlock>

          <DemoBlock
            title="链接按钮"
            description="ButtonLink 支持站内与外部链接。"
            code={LINK_DEMO_CODE}
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <ButtonLink to="/component-docs/button">站内链接</ButtonLink>
              <ButtonLink to="/component-docs/button" target="_blank">
                新标签页打开
              </ButtonLink>
              <ButtonLink to="/component-docs/button" disabled>
                禁用链接
              </ButtonLink>
              <ButtonLink href="https://soybeanjs.cn">外部链接</ButtonLink>
            </div>
          </DemoBlock>

          <DemoBlock
            title="按钮组"
            description="ButtonGroup 会向子按钮继承样式属性。"
            code={GROUP_DEMO_CODE}
          >
            <div className="flex flex-wrap items-start justify-center gap-6">
              <ButtonGroup variant="pure" color="accent" className="whitespace-nowrap">
                <Button>Button 1</Button>
                <Button>Button 2</Button>
                <Button>Button 3</Button>
              </ButtonGroup>
              <ButtonGroup
                orientation="vertical"
                className="w-32"
                variant="outline"
                color="warning"
              >
                <Button>Button 1</Button>
                <Button>Button 2</Button>
                <Button>Button 3</Button>
              </ButtonGroup>
            </div>
          </DemoBlock>
        </div>
      </DocSection>

      <DocSection
        title="属性说明 (API)"
        description="Button 组件属性遵循 HTMLButtonElement 标准并扩展。"
      >
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">属性</th>
                <th className="px-4 py-3 font-medium">说明</th>
                <th className="px-4 py-3 font-medium">类型</th>
                <th className="px-4 py-3 font-medium">默认值</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {doc.api.map((item) => (
                <tr key={item.name} className="group hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground group-hover:text-foreground">
                    {item.description}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    <span className="rounded bg-muted px-1.5 py-0.5 text-foreground">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {item.defaultValue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocSection>

      <div className="grid gap-10 md:grid-cols-2">
        <DocSection title="状态指南">
          <div className="rounded-xl border border-border bg-card p-1">
            <div className="divide-y divide-border">
              <div className="flex items-center gap-4 p-4">
                <div className="w-24 shrink-0 text-center">
                  <Button size="sm">保存</Button>
                </div>
                <div>
                  <p className="font-medium text-sm">默认状态</p>
                  <p className="text-xs text-muted-foreground">用于常规可交互场景。</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4">
                <div className="w-24 shrink-0 text-center">
                  <Button size="sm" disabled>
                    保存
                  </Button>
                </div>
                <div>
                  <p className="font-medium text-sm">禁用状态 (Disabled)</p>
                  <p className="text-xs text-muted-foreground">依赖项未满足或权限不足时使用。</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4">
                <div className="w-24 shrink-0 text-center">
                  <Button size="sm" disabled>
                    <LoaderCircle className="mr-1.5 size-3.5 animate-spin" />
                    保存
                  </Button>
                </div>
                <div>
                  <p className="font-medium text-sm">加载状态 (Loading)</p>
                  <p className="text-xs text-muted-foreground">
                    异步操作执行中，通过 disabled 防止重复提交。
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4">
                <div className="w-24 shrink-0 text-center">
                  <Button size="sm" variant="destructive">
                    重试
                  </Button>
                </div>
                <div>
                  <p className="font-medium text-sm">错误/危险 (Destructive)</p>
                  <p className="text-xs text-muted-foreground">用于不可逆操作或强调错误修正。</p>
                </div>
              </div>
            </div>
          </div>
        </DocSection>

        <DocSection title="尺寸变体">
          <div className="grid gap-4 rounded-xl border border-border bg-card p-6">
            <div className="grid grid-cols-[80px_1fr] items-center gap-4">
              <span className="font-mono text-xs text-muted-foreground">lg</span>
              <div className="flex items-center gap-2">
                <Button size="lg">Large Button</Button>
                <Button size="icon-lg">
                  <Plus className="size-5" />
                </Button>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-[80px_1fr] items-center gap-4">
              <span className="font-mono text-xs text-muted-foreground">default</span>
              <div className="flex items-center gap-2">
                <Button>Default Button</Button>
                <Button size="icon">
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-[80px_1fr] items-center gap-4">
              <span className="font-mono text-xs text-muted-foreground">sm</span>
              <div className="flex items-center gap-2">
                <Button size="sm">Small Button</Button>
                <Button size="icon-sm">
                  <Plus className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </DocSection>
      </div>

      <DocSection title="样式变量 (Theme)">
        <p className="mb-4 text-sm text-muted-foreground">
          通过调整 CSS 变量可全局控制按钮视觉风格。
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "--primary",
              desc: "Default 变体背景色",
              colors: ["bg-primary", "bg-primary-foreground"],
            },
            {
              name: "--secondary",
              desc: "Secondary 变体背景色",
              colors: ["bg-secondary", "bg-secondary-foreground"],
            },
            {
              name: "--destructive",
              desc: "Destructive 变体背景色",
              colors: ["bg-destructive", "bg-destructive-foreground"],
            },
            {
              name: "--accent",
              desc: "Ghost/Outline 悬停背景色",
              colors: ["bg-accent", "bg-accent-foreground"],
            },
            {
              name: "--muted",
              desc: "禁用态背景/次要文本",
              colors: ["bg-muted", "bg-muted-foreground"],
            },
            {
              name: "--ring",
              desc: "Focus 聚焦环颜色",
              colors: ["bg-ring"],
            },
          ].map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-3 rounded-lg border border-border p-3"
            >
              <div className="flex shrink-0 -space-x-1.5 overflow-hidden">
                {item.colors.map((c, i) => (
                  <div key={i} className={cn("size-6 rounded-full ring-2 ring-background", c)} />
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs font-semibold">{item.name}</p>
                <p className="truncate text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection title="常见问题 (FAQ)">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">如何作为链接使用？</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              使用{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
                asChild
              </code>{" "}
              属性， 并将
              <code className="mx-1 rounded bg-muted px-1 py-0.5 font-mono text-foreground">
                BaseLink
              </code>
              作为直接子元素。
              <div className="mt-2 rounded-md bg-muted/50 p-3 font-mono text-xs text-foreground">
                {'<Button asChild>\n  <BaseLink to="/home">Go Home</BaseLink>\n</Button>'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">如何修改圆角？</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              在{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
                globals.css
              </code>{" "}
              中修改{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-foreground">
                --radius
              </code>{" "}
              变量，这将统一影响 Button、Card、Input 等所有组件的圆角风格。
            </CardContent>
          </Card>
        </div>
      </DocSection>
    </div>
  )
}

export const buttonDoc: ComponentDoc = {
  slug: "button",
  name: "Button",
  category: "基础组件",
  status: "stable",
  since: "0.1.0",
  summary: "用于触发即时操作，是页面中的核心交互入口。",
  usage: "优先使用 variant 表达语义，不要在业务层直接重写按钮基础样式。",
  docsPath: "packages/ui/button.tsx",
  scenarios: ["表单提交", "弹窗确认", "页面跳转", "批量操作"],
  notes: [
    "操作语义明确：主操作用 solid，次操作用 outline / ghost / pure。",
    "按钮文本使用动词短语，避免歧义文案。",
    "异步提交优先使用 ButtonLoading，避免重复点击。",
  ],
  api: [
    {
      name: "color",
      type: '"primary" | "destructive" | "success" | "warning" | "info" | "carbon" | "secondary" | "accent"',
      defaultValue: '"primary"',
      description: "控制按钮语义色与焦点环颜色。",
    },
    {
      name: "variant",
      type: '"solid" | "outline" | "dashed" | "soft" | "ghost" | "link" | "plain" | "pure" | "default" | "destructive" | "secondary"',
      defaultValue: '"solid"',
      description: "控制按钮语义与视觉样式。",
    },
    {
      name: "size",
      type: '"xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "default" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"',
      defaultValue: '"md"',
      description: "控制按钮尺寸和内边距。",
    },
    {
      name: "shape",
      type: '"auto" | "rounded" | "square" | "circle"',
      defaultValue: '"auto"',
      description: "控制按钮外轮廓形状。",
    },
    {
      name: "shadow",
      type: '"none" | "sm" | "md" | "lg"',
      defaultValue: '"none"',
      description: "控制按钮阴影层级。",
    },
    {
      name: "fitContent",
      type: "boolean",
      defaultValue: "false",
      description: "让按钮按内容自适应尺寸。",
    },
    {
      name: "leading / trailing",
      type: "ReactNode",
      defaultValue: "-",
      description: "按钮前后附加内容（图标、标签等）。",
    },
    {
      name: "asChild",
      type: "boolean",
      defaultValue: "false",
      description: "将样式注入子组件，常用于与 BaseLink 组合。",
    },
    {
      name: "type",
      type: '"button" | "submit" | "reset"',
      defaultValue: "submit",
      description: "原生按钮类型，推荐在表单中显式声明。",
    },
    {
      name: "disabled",
      type: "boolean",
      defaultValue: "false",
      description: "禁用点击与键盘触发，并应用禁用样式。",
    },
  ],
  renderDetail: (doc) => <ButtonDocDetail doc={doc} />,
}
