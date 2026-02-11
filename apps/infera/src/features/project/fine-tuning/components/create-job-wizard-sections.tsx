import { AlertTriangle, Cpu, Sparkles } from "lucide-react"
import type { Dispatch, ReactNode, SetStateAction } from "react"
import { Badge } from "@/packages/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/packages/ui/collapsible"
import { Input } from "@/packages/ui/input"
import { Label } from "@/packages/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import type {
  FineTuningDatasetOption,
  FineTuningResourceOption,
  FineTuningWizardOptions,
} from "../types"
import type { CreateJobWizardState } from "./create-job-wizard.state"

interface SectionProps {
  state: CreateJobWizardState
  setState: Dispatch<SetStateAction<CreateJobWizardState>>
  options: FineTuningWizardOptions | undefined
}

export function BaseModelStepSection({ state, setState, options }: SectionProps) {
  const selectedBaseModel =
    options?.baseModels.find((item) => item.resolvedVersionId === state.baseModelVersionId) ?? null

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>任务名称</Label>
        <Input
          placeholder="例如：chat-lora-sft-v5"
          value={state.jobName}
          onChange={(event) =>
            setState((previous) => ({ ...previous, jobName: event.target.value }))
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <Label>选择模型 Tag / Version</Label>
          <Select
            value={state.baseModelVersionId}
            onValueChange={(value) =>
              setState((previous) => ({ ...previous, baseModelVersionId: value }))
            }
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue placeholder="选择基座模型" />
            </SelectTrigger>
            <SelectContent>
              {options?.baseModels.map((item) => (
                <SelectItem
                  key={item.resolvedVersionId}
                  value={item.resolvedVersionId}
                  className="cursor-pointer"
                >
                  {item.modelName} · {item.tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>解析后 base_model_version_id</Label>
          <div className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2 font-mono text-xs">
            {selectedBaseModel?.resolvedVersionId ?? "请先选择模型"}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <Label>输出模型命名</Label>
          <Input
            placeholder="例如：project-chat-lora-v5"
            value={state.outputModelName}
            onChange={(event) =>
              setState((previous) => ({ ...previous, outputModelName: event.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>输出 artifact_type</Label>
          <Select
            value={state.artifactType}
            onValueChange={(value) =>
              setState((previous) => ({
                ...previous,
                artifactType: value as CreateJobWizardState["artifactType"],
              }))
            }
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Adapter" className="cursor-pointer">
                Adapter
              </SelectItem>
              <SelectItem value="Full" className="cursor-pointer">
                Full
              </SelectItem>
              <SelectItem value="Merged" className="cursor-pointer">
                Merged
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedBaseModel ? (
        <div className="rounded-lg border border-border/50 bg-card p-4 text-sm">
          <p className="mb-2 text-sm font-semibold">模型 metadata</p>
          <div className="grid gap-2 text-xs text-muted-foreground lg:grid-cols-4">
            <p>参数量：{selectedBaseModel.metadata.parameterSize}</p>
            <p>上下文：{selectedBaseModel.metadata.contextLength}</p>
            <p>License：{selectedBaseModel.metadata.license}</p>
            <p>Quantization：{selectedBaseModel.metadata.quantization}</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function DatasetStepSection({ state, setState, options }: SectionProps) {
  const selectedDataset =
    options?.datasets.find((item) => item.datasetVersionId === state.datasetVersionId) ?? null

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>选择数据集版本</Label>
        <Select
          value={state.datasetVersionId}
          onValueChange={(value) =>
            setState((previous) => ({ ...previous, datasetVersionId: value }))
          }
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue placeholder="选择 dataset_version_id" />
          </SelectTrigger>
          <SelectContent>
            {options?.datasets.map((item) => (
              <SelectItem
                key={item.datasetVersionId}
                value={item.datasetVersionId}
                className="cursor-pointer"
              >
                {item.datasetName} · {item.datasetVersionId}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedDataset ? <DatasetSummaryCard dataset={selectedDataset} /> : null}
    </div>
  )
}

function DatasetSummaryCard({ dataset }: { dataset: FineTuningDatasetOption }) {
  return (
    <div className="space-y-4 rounded-lg border border-border/50 bg-card p-4">
      <div className="grid gap-3 lg:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">rows</p>
          <p className="text-lg font-semibold tabular-nums">{dataset.rows}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">schema fields</p>
          <p className="text-sm">{dataset.schemaFields.join(" / ")}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">token_stats</p>
          <p className="text-sm tabular-nums">
            {dataset.tokenStats.promptTokens} / {dataset.tokenStats.totalTokens}
          </p>
        </div>
      </div>

      {dataset.riskHints.length > 0 ? (
        <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3 text-xs text-orange-500">
          <div className="mb-1 flex items-center gap-2 font-medium">
            <AlertTriangle className="size-4" />
            潜在风险提示
          </div>
          <ul className="space-y-1">
            {dataset.riskHints.map((hint) => (
              <li key={hint}>• {hint}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-500">
          数据集校验通过，未发现 schema/tokenizer 风险。
        </div>
      )}
    </div>
  )
}

export function TrainingConfigStepSection({ state, setState }: Omit<SectionProps, "options">) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-4">
        <ConfigInput label="Training type">
          <Select
            value={state.trainingType}
            onValueChange={(value) =>
              setState((previous) => ({ ...previous, trainingType: value as "LoRA" | "Full" }))
            }
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LoRA" className="cursor-pointer">
                LoRA
              </SelectItem>
              <SelectItem value="Full" className="cursor-pointer">
                Full
              </SelectItem>
            </SelectContent>
          </Select>
        </ConfigInput>
        <ConfigInput label="Epochs">
          <Input
            type="number"
            value={state.epochs}
            onChange={(event) =>
              setState((previous) => ({ ...previous, epochs: Number(event.target.value) }))
            }
          />
        </ConfigInput>
        <ConfigInput label="Batch Size">
          <Input
            type="number"
            value={state.batchSize}
            onChange={(event) =>
              setState((previous) => ({ ...previous, batchSize: Number(event.target.value) }))
            }
          />
        </ConfigInput>
        <ConfigInput label="Learning Rate">
          <Input
            type="number"
            step="0.000001"
            value={state.learningRate}
            onChange={(event) =>
              setState((previous) => ({ ...previous, learningRate: Number(event.target.value) }))
            }
          />
        </ConfigInput>
      </div>

      <Collapsible defaultOpen={false} className="rounded-lg border border-border/50 bg-card p-4">
        <CollapsibleTrigger className="cursor-pointer text-sm font-medium">
          高级训练参数
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Input
              type="number"
              value={state.gradientAccumulation}
              onChange={(event) =>
                setState((previous) => ({
                  ...previous,
                  gradientAccumulation: Number(event.target.value),
                }))
              }
              placeholder="gradient accumulation"
            />
            <Input
              type="number"
              value={state.warmupSteps}
              onChange={(event) =>
                setState((previous) => ({ ...previous, warmupSteps: Number(event.target.value) }))
              }
              placeholder="warmup steps"
            />
            <Input
              type="number"
              step="0.01"
              value={state.weightDecay}
              onChange={(event) =>
                setState((previous) => ({ ...previous, weightDecay: Number(event.target.value) }))
              }
              placeholder="weight decay"
            />
          </div>
          {state.trainingType === "LoRA" ? (
            <div className="grid gap-4 lg:grid-cols-3">
              <Input
                type="number"
                value={state.loraR}
                onChange={(event) =>
                  setState((previous) => ({ ...previous, loraR: Number(event.target.value) }))
                }
                placeholder="lora r"
              />
              <Input
                type="number"
                value={state.loraAlpha}
                onChange={(event) =>
                  setState((previous) => ({ ...previous, loraAlpha: Number(event.target.value) }))
                }
                placeholder="lora alpha"
              />
              <Input
                type="number"
                step="0.01"
                value={state.loraDropout}
                onChange={(event) =>
                  setState((previous) => ({ ...previous, loraDropout: Number(event.target.value) }))
                }
                placeholder="lora dropout"
              />
            </div>
          ) : null}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

function ConfigInput({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

export function ResourceCostStepSection({ state, setState, options }: SectionProps) {
  const selectedResource =
    options?.resources.find((item) => item.resourceId === state.resourceId) ?? null

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>GPU 规格</Label>
        <Select
          value={state.resourceId}
          onValueChange={(value) => setState((previous) => ({ ...previous, resourceId: value }))}
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue placeholder="选择资源规格" />
          </SelectTrigger>
          <SelectContent>
            {options?.resources.map((item) => (
              <SelectItem key={item.resourceId} value={item.resourceId} className="cursor-pointer">
                {item.label} · {item.resourcePool}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>预算上限（可选）</Label>
        <Input
          placeholder="例如：¥ 5,000"
          value={state.budgetLimit}
          onChange={(event) =>
            setState((previous) => ({ ...previous, budgetLimit: event.target.value }))
          }
        />
      </div>

      <ResourceSummaryCard resource={selectedResource} />
    </div>
  )
}

function ResourceSummaryCard({ resource }: { resource: FineTuningResourceOption | null }) {
  return (
    <div className="rounded-lg border border-border/50 bg-card p-4">
      <div className="grid gap-2 text-sm">
        <p className="flex items-center gap-2">
          <Cpu className="size-4 text-muted-foreground" />
          资源池：{resource?.resourcePool ?? "-"}
        </p>
        <p>预估 GPU-hours：{resource?.estimatedGpuHours ?? "-"}</p>
        <p>预估费用区间：{resource?.estimatedCostRange ?? "-"}</p>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        以上成本仅为估算值，实际成本受数据规模与资源波动影响。
      </p>
    </div>
  )
}

export function ConfirmStepSection({
  state,
  resourceLabel,
  resourceCost,
}: {
  state: CreateJobWizardState
  resourceLabel: string
  resourceCost: string
}) {
  return (
    <div className="space-y-4 rounded-lg border border-border/50 bg-card p-4 text-sm">
      <p className="font-medium">Summary</p>
      <p>任务：{state.jobName || "未填写"}</p>
      <p>base_model_version_id：{state.baseModelVersionId || "未选择"}</p>
      <p>dataset_version_id：{state.datasetVersionId || "未选择"}</p>
      <p>
        训练参数：{state.trainingType} · epochs={state.epochs} · batch={state.batchSize} · lr=
        {state.learningRate}
      </p>
      <p>资源规格：{resourceLabel}</p>
      <p>预估成本：{resourceCost}</p>
      <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs text-blue-500">
        <Sparkles className="mr-1 inline size-3.5" />
        提交后可在任务详情查看 Metrics、Logs、Artifacts 和 Audit。
      </div>
      {state.jobName.trim().length < 2 ? (
        <Badge variant="outline" className="border-destructive/40 text-destructive">
          请填写任务名称
        </Badge>
      ) : null}
    </div>
  )
}
