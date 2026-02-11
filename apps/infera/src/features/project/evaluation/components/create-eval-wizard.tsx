import { GitCompareArrows, ListChecks, ShieldCheck } from "lucide-react"
import { useMemo, useState } from "react"
import { Wizard, type WizardStep } from "@/features/shared/components"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/packages/ui/dialog"
import { Input } from "@/packages/ui/input"
import { Label } from "@/packages/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { cn } from "@/packages/ui-utils"
import { useEvaluationWizardOptionsQuery } from "../hooks"
import type { CreateEvaluationRunInput, EvaluationType } from "../types"

interface CreateEvaluationWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  projectId: string
  submitting: boolean
  onSubmit: (input: CreateEvaluationRunInput) => Promise<void>
}

interface WizardState {
  evalType: EvaluationType
  modelVersionIdA: string
  modelVersionIdB: string
  datasetVersionId: string
  selectedMetrics: string[]
  notes: string
}

const INITIAL_STATE: WizardState = {
  evalType: "auto",
  modelVersionIdA: "",
  modelVersionIdB: "",
  datasetVersionId: "",
  selectedMetrics: ["loss", "perplexity", "rouge-l"],
  notes: "",
}

const TYPE_OPTIONS: Array<{
  value: EvaluationType
  title: string
  description: string
  icon: typeof ListChecks
}> = [
  {
    value: "auto",
    title: "自动评估",
    description: "单模型自动跑标准指标",
    icon: ListChecks,
  },
  {
    value: "comparison",
    title: "对比评估",
    description: "双模型 Side-by-Side 对比",
    icon: GitCompareArrows,
  },
  {
    value: "gate",
    title: "回归门禁",
    description: "基于规则进行 Pass/Fail 判定",
    icon: ShieldCheck,
  },
]

export function CreateEvaluationWizard({
  open,
  onOpenChange,
  tenantId,
  projectId,
  submitting,
  onSubmit,
}: CreateEvaluationWizardProps) {
  const [state, setState] = useState(INITIAL_STATE)
  const optionsQuery = useEvaluationWizardOptionsQuery(tenantId, projectId)
  const options = optionsQuery.data

  const selectedDataset = options?.datasets.find(
    (item) => item.datasetVersionId === state.datasetVersionId,
  )

  const steps = useMemo<WizardStep[]>(
    () => [
      {
        id: "type",
        title: "选择评估类型",
        validate: () => Boolean(state.evalType),
        content: (
          <div className="grid gap-3 lg:grid-cols-3">
            {TYPE_OPTIONS.map((option) => {
              const Icon = option.icon
              const active = option.value === state.evalType
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setState((previous) => ({ ...previous, evalType: option.value }))}
                  className={cn(
                    "cursor-pointer rounded-lg border p-4 text-left transition-all duration-200",
                    active ? "border-primary bg-primary/5" : "border-border/50 hover:bg-muted/40",
                  )}
                >
                  <Icon className="mb-2 size-5 text-primary" />
                  <p className="text-sm font-medium">{option.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
                </button>
              )
            })}
          </div>
        ),
      },
      {
        id: "target",
        title: "模型与数据",
        validate: () => {
          if (state.modelVersionIdA.length === 0 || state.datasetVersionId.length === 0) {
            return false
          }
          if (state.evalType === "comparison" && state.modelVersionIdB.length === 0) {
            return false
          }
          return state.selectedMetrics.length > 0
        },
        content: (
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label>模型 A（model_version_id）</Label>
                <Select
                  value={state.modelVersionIdA}
                  onValueChange={(value) =>
                    setState((previous) => ({ ...previous, modelVersionIdA: value }))
                  }
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="选择模型 A" />
                  </SelectTrigger>
                  <SelectContent>
                    {options?.models.map((model) => (
                      <SelectItem
                        key={model.modelVersionId}
                        value={model.modelVersionId}
                        className="cursor-pointer"
                      >
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {state.evalType === "comparison" ? (
                <div className="space-y-2">
                  <Label>模型 B（对照组）</Label>
                  <Select
                    value={state.modelVersionIdB}
                    onValueChange={(value) =>
                      setState((previous) => ({ ...previous, modelVersionIdB: value }))
                    }
                  >
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue placeholder="选择模型 B" />
                    </SelectTrigger>
                    <SelectContent>
                      {options?.models
                        .filter((model) => model.modelVersionId !== state.modelVersionIdA)
                        .map((model) => (
                          <SelectItem
                            key={model.modelVersionId}
                            value={model.modelVersionId}
                            className="cursor-pointer"
                          >
                            {model.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>评估数据集 / Benchmark</Label>
              <Select
                value={state.datasetVersionId}
                onValueChange={(value) =>
                  setState((previous) => ({ ...previous, datasetVersionId: value }))
                }
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="选择数据源" />
                </SelectTrigger>
                <SelectContent>
                  {options?.datasets.map((dataset) => (
                    <SelectItem
                      key={dataset.datasetVersionId}
                      value={dataset.datasetVersionId}
                      className="cursor-pointer"
                    >
                      {dataset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>指标（多选）</Label>
              <div className="grid gap-2 rounded-lg border border-border/50 bg-card p-3 lg:grid-cols-3">
                {options?.metrics.map((metric) => {
                  const checked = state.selectedMetrics.includes(metric)
                  return (
                    <button
                      key={metric}
                      type="button"
                      onClick={() => {
                        setState((previous) => ({
                          ...previous,
                          selectedMetrics: checked
                            ? previous.selectedMetrics.filter((item) => item !== metric)
                            : [...previous.selectedMetrics, metric],
                        }))
                      }}
                      className={cn(
                        "cursor-pointer rounded-md border px-3 py-2 text-xs transition-colors",
                        checked
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 hover:bg-muted/30",
                      )}
                    >
                      {metric}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "confirm",
        title: "配置确认",
        content: (
          <div className="space-y-4 rounded-lg border border-border/50 bg-card p-4 text-sm">
            <p className="font-medium">Summary</p>
            <p>评估类型：{state.evalType}</p>
            <p>模型 A：{state.modelVersionIdA || "未选择"}</p>
            {state.evalType === "comparison" ? (
              <p>模型 B：{state.modelVersionIdB || "未选择"}</p>
            ) : null}
            <p>数据源：{selectedDataset?.label ?? "未选择"}</p>
            <p>指标：{state.selectedMetrics.join(" / ") || "未选择"}</p>
            <div className="space-y-2">
              <Label>备注（可选）</Label>
              <Input
                value={state.notes}
                onChange={(event) =>
                  setState((previous) => ({ ...previous, notes: event.target.value }))
                }
                placeholder="例如：回归门禁发布前验证"
              />
            </div>
          </div>
        ),
      },
    ],
    [options?.datasets, options?.metrics, options?.models, selectedDataset?.label, state],
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) {
          setState(INITIAL_STATE)
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>创建评估任务</DialogTitle>
        </DialogHeader>
        <Wizard
          steps={steps}
          submitLabel="创建评估"
          isSubmitting={submitting}
          submitDisabled={
            !options ||
            state.modelVersionIdA.length === 0 ||
            state.datasetVersionId.length === 0 ||
            state.selectedMetrics.length === 0 ||
            (state.evalType === "comparison" && state.modelVersionIdB.length === 0)
          }
          onSubmit={async () => {
            const payload: CreateEvaluationRunInput = {
              tenantId,
              projectId,
              evalType: state.evalType,
              modelVersionIdA: state.modelVersionIdA,
              datasetVersionId: state.datasetVersionId,
              selectedMetrics: state.selectedMetrics,
            }

            if (state.evalType === "comparison") {
              payload.modelVersionIdB = state.modelVersionIdB
            }

            const normalizedNotes = state.notes.trim()
            if (normalizedNotes.length > 0) {
              payload.notes = normalizedNotes
            }

            await onSubmit(payload)
            onOpenChange(false)
            setState(INITIAL_STATE)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
