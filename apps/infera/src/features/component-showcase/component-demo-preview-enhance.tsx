import * as React from "react"
import { Anchor } from "@/packages/ui/anchor"
import { BackTop } from "@/packages/ui/back-top"
import { Button } from "@/packages/ui/button"
import { ColorPicker } from "@/packages/ui/color-picker"
import { Mentions } from "@/packages/ui/mentions"
import { QRCode } from "@/packages/ui/qr-code"
import { Rate } from "@/packages/ui/rate"
import { Tour, type TourStep } from "@/packages/ui/tour"
import { Watermark } from "@/packages/ui/watermark"

export type EnhanceDemoSlug =
  | "anchor"
  | "back-top"
  | "tour"
  | "watermark"
  | "qr-code"
  | "mentions"
  | "rate"
  | "color-picker"

type ComponentDemoPreviewRenderer = () => React.ReactNode

function AnchorPreview() {
  const containerRef = React.useRef<HTMLDivElement | null>(null)

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <Anchor
        affix={false}
        target={() => containerRef.current}
        items={[
          { href: "#anchor-intro", title: "组件介绍" },
          { href: "#anchor-api", title: "API 说明" },
          { href: "#anchor-notes", title: "使用建议" },
        ]}
      />
      <div
        ref={containerRef}
        className="max-h-72 space-y-6 overflow-y-auto rounded-lg border border-border/50 bg-card p-4"
      >
        <section id="anchor-intro" className="space-y-2">
          <h4 className="text-sm font-semibold">组件介绍</h4>
          <p className="text-sm text-muted-foreground">
            Anchor 通过监听滚动位置自动高亮章节，并可点击快速滚动到目标内容。
          </p>
        </section>
        <section id="anchor-api" className="space-y-2">
          <h4 className="text-sm font-semibold">API 说明</h4>
          <p className="text-sm text-muted-foreground">
            通过 `items` 定义锚点，通过 `target` 指定滚动容器，通过 `offset` 调整吸附偏移。
          </p>
        </section>
        <section id="anchor-notes" className="space-y-2">
          <h4 className="text-sm font-semibold">使用建议</h4>
          <p className="text-sm text-muted-foreground">
            推荐用于文档页、长表单或设置中心，帮助用户快速定位大段内容。
          </p>
          <div className="h-40 rounded-md border border-dashed border-border/60 bg-muted/20" />
        </section>
      </div>
    </div>
  )
}

function BackTopPreview() {
  const scrollRef = React.useRef<HTMLDivElement | null>(null)

  return (
    <div className="space-y-3">
      <div
        ref={scrollRef}
        className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-border/50 bg-card p-3"
      >
        {Array.from({ length: 18 }).map((_, index) => (
          <p key={`log-${index + 1}`} className="text-sm text-muted-foreground">
            第 {index + 1} 条日志：服务 `chat-gateway` 健康探测通过。
          </p>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        示例将可见阈值设为 0，便于直接观察按钮样式与点击行为。
      </p>
      <BackTop target={() => scrollRef.current} visibleHeight={0} right={24} bottom={24} />
    </div>
  )
}

function TourPreview() {
  const [open, setOpen] = React.useState(false)

  const steps = React.useMemo<TourStep[]>(
    () => [
      {
        target: "#tour-trigger-zone",
        title: "发布按钮区",
        description: "这里可发起灰度或全量发布。",
        placement: "bottom",
      },
      {
        target: "#tour-metrics-zone",
        title: "监控指标区",
        description: "发布后重点观察错误率和延迟波动。",
        placement: "top",
      },
    ],
    [],
  )

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-2">
        <div id="tour-trigger-zone" className="rounded-lg border border-border/50 bg-card p-4">
          <p className="text-sm font-medium">发布控制</p>
          <p className="mt-1 text-xs text-muted-foreground">包含发布、回滚、流量切换操作。</p>
        </div>
        <div id="tour-metrics-zone" className="rounded-lg border border-border/50 bg-card p-4">
          <p className="text-sm font-medium">核心指标</p>
          <p className="mt-1 text-xs text-muted-foreground">QPS、错误率、P95 延迟。</p>
        </div>
      </div>
      <Button
        type="button"
        className="cursor-pointer"
        onClick={() => {
          setOpen(true)
        }}
      >
        开始引导示例
      </Button>
      <Tour
        open={open}
        onOpenChange={setOpen}
        onFinish={() => {
          setOpen(false)
        }}
        steps={steps}
      />
    </div>
  )
}

function WatermarkPreview() {
  return (
    <Watermark content={["Infera Internal", "Tenant: Acme AI"]} gap={[180, 120]} opacity={0.2}>
      <div className="rounded-lg border border-border/50 bg-card p-4">
        <p className="text-sm font-medium">模型评测报告（节选）</p>
        <p className="mt-2 text-sm text-muted-foreground">
          本报告仅供内部评审使用，含敏感指标与业务判断，请勿外传。
        </p>
      </div>
    </Watermark>
  )
}

function QRCodePreview() {
  const [status, setStatus] = React.useState<"active" | "expired">("active")

  return (
    <div className="flex flex-wrap items-start gap-3">
      <QRCode
        value="https://infera.example.com/share/deploy?id=chat-gateway"
        status={status}
        onRefresh={() => {
          setStatus("active")
        }}
      />
      <Button
        type="button"
        variant="outline"
        className="cursor-pointer"
        onClick={() => {
          setStatus("expired")
        }}
      >
        模拟过期
      </Button>
    </div>
  )
}

function MentionsPreview() {
  const [value, setValue] = React.useState("请 @alice 跟进线上延迟波动。")

  return (
    <Mentions
      value={value}
      onChange={setValue}
      rows={4}
      options={[
        { value: "alice", label: "Alice / 平台负责人" },
        { value: "bob", label: "Bob / SRE" },
        { value: "carol", label: "Carol / 算法工程师" },
      ]}
      placeholder="输入 @ 触发提及"
    />
  )
}

function RatePreview() {
  const [value, setValue] = React.useState(3.5)

  return (
    <div className="space-y-2">
      <Rate value={value} onChange={setValue} allowHalf />
      <p className="text-sm text-muted-foreground">当前评分：{value} / 5</p>
    </div>
  )
}

function ColorPickerPreview() {
  const [color, setColor] = React.useState("#1677ff")

  return (
    <div className="space-y-3">
      <ColorPicker
        value={color}
        onChange={setColor}
        presets={["#1677ff", "#52c41a", "#fa8c16", "#f5222d"]}
      />
      <div className="inline-flex items-center gap-2 rounded-md border border-border/50 px-3 py-1.5 text-sm">
        <span className="inline-block size-3 rounded-full" style={{ backgroundColor: color }} />
        当前色值：{color}
      </div>
    </div>
  )
}

export const ENHANCE_COMPONENT_PREVIEW_RENDERERS = {
  anchor: AnchorPreview,
  "back-top": BackTopPreview,
  tour: TourPreview,
  watermark: WatermarkPreview,
  "qr-code": QRCodePreview,
  mentions: MentionsPreview,
  rate: RatePreview,
  "color-picker": ColorPickerPreview,
} satisfies Record<EnhanceDemoSlug, ComponentDemoPreviewRenderer>
