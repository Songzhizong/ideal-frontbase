import { CheckCircle2Icon } from "lucide-react"
import * as React from "react"
import { Badge } from "@/packages/ui/badge"
import { Button } from "@/packages/ui/button"
import { CopyButton, CopyText } from "@/packages/ui/copy-button"
import { DescriptionList } from "@/packages/ui/description-list"
import { Result } from "@/packages/ui/result"
import { StatCard } from "@/packages/ui/stat-card"
import { Statistic } from "@/packages/ui/statistic"
import { Steps } from "@/packages/ui/steps"
import { Upload, UploadDragger } from "@/packages/ui/upload"
import { Wizard, type WizardStep } from "@/packages/ui/wizard"

export type BasicDemoSlug =
  | "copy"
  | "description-list"
  | "statistic"
  | "stat-card"
  | "result"
  | "upload"
  | "steps"
  | "wizard"

type ComponentDemoPreviewRenderer = () => React.ReactNode

function CopyPreview() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <CopyButton value="sk-live-9xw2-example-token" size="sm" variant="outline" />
      <CopyText value="https://api.example.com/v1/services/alpha" className="max-w-sm" />
    </div>
  )
}

function DescriptionListPreview() {
  return (
    <DescriptionList
      column={2}
      bordered
      items={[
        {
          label: "服务名称",
          value: "chat-gateway",
        },
        {
          label: "环境",
          value: "Production",
        },
        {
          label: "负责人",
          value: "Ming Zhao",
        },
        {
          label: "最近发布时间",
          value: "2026-02-15 20:18",
        },
      ]}
    />
  )
}

function StatisticPreview() {
  return (
    <div className="max-w-xs rounded-lg border border-border/50 bg-card p-4">
      <Statistic label="今日请求量" value={238421} suffix="次" trend="up" trendValue="+12.4%" />
    </div>
  )
}

function StatCardPreview() {
  return (
    <div className="max-w-md">
      <StatCard
        label="推理成功率"
        value={99.38}
        suffix="%"
        precision={2}
        trend="up"
        trendValue="+0.42%"
        description="过去 24 小时"
        footer={<Badge variant="outline">稳定运行</Badge>}
      />
    </div>
  )
}

function ResultPreview() {
  return (
    <Result
      status="success"
      title="模型已发布"
      subtitle="流量已切换到新版本，可前往服务页查看实时指标。"
      extra={
        <>
          <Button type="button" size="sm" className="cursor-pointer">
            查看服务
          </Button>
          <Button type="button" size="sm" variant="outline" className="cursor-pointer">
            查看发布记录
          </Button>
        </>
      }
    />
  )
}

function UploadPreview() {
  const handleUpload = React.useCallback(async (file: File) => {
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 700)
    })

    return {
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
    }
  }, [])

  return (
    <div className="space-y-4">
      <Upload
        accept=".json,.csv"
        maxSize={8 * 1024 * 1024}
        maxCount={2}
        onUpload={handleUpload}
        triggerLabel="选择文件上传"
      />
      <UploadDragger
        accept=".json,.csv"
        maxSize={8 * 1024 * 1024}
        maxCount={2}
        onUpload={handleUpload}
        title="拖拽数据文件到这里"
        description="支持 JSON / CSV，单文件不超过 8MB"
      />
    </div>
  )
}

function StepsPreview() {
  const [current, setCurrent] = React.useState(1)

  return (
    <div className="space-y-3">
      <Steps
        current={current}
        onStepChange={setCurrent}
        items={[
          {
            title: "基础配置",
            description: "设置服务名称与环境",
          },
          {
            title: "资源配额",
            description: "配置 CPU / Memory",
          },
          {
            title: "发布确认",
            description: "确认并提交",
          },
        ]}
      />
      <p className="text-sm text-muted-foreground">当前步骤：第 {current + 1} 步</p>
    </div>
  )
}

function WizardPreview() {
  const [finished, setFinished] = React.useState(false)

  const steps = React.useMemo<WizardStep[]>(
    () => [
      {
        id: "basic",
        title: "基础信息",
        description: "填写服务元数据",
        content: (
          <div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-4 text-sm">
            <p>服务名称：`chat-gateway`</p>
            <p>所属环境：`Production`</p>
          </div>
        ),
      },
      {
        id: "resource",
        title: "资源策略",
        description: "配置副本与自动扩缩",
        content: (
          <div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-4 text-sm">
            <p>最小副本：2</p>
            <p>最大副本：10</p>
          </div>
        ),
      },
      {
        id: "confirm",
        title: "提交发布",
        description: "最终确认配置",
        content: (
          <div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-4 text-sm">
            <p>确认后将触发灰度发布并更新流量策略。</p>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <div className="space-y-3">
      <Wizard
        steps={steps}
        onFinish={() => {
          setFinished(true)
        }}
      />
      {finished ? (
        <div className="inline-flex items-center gap-1 rounded-md border border-success/40 bg-success-subtle px-3 py-1 text-sm text-success-on-subtle">
          <CheckCircle2Icon className="size-4" aria-hidden />
          已完成示例向导
        </div>
      ) : null}
    </div>
  )
}

export const BASIC_COMPONENT_PREVIEW_RENDERERS = {
  copy: CopyPreview,
  "description-list": DescriptionListPreview,
  statistic: StatisticPreview,
  "stat-card": StatCardPreview,
  result: ResultPreview,
  upload: UploadPreview,
  steps: StepsPreview,
  wizard: WizardPreview,
} satisfies Record<BasicDemoSlug, ComponentDemoPreviewRenderer>
