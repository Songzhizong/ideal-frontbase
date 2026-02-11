import { useMemo, useState } from "react"
import { Wizard, type WizardStep } from "@/features/shared/components"
import { DiffViewer } from "@/features/shared/components/diff-viewer"
import { Button } from "@/packages/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/packages/ui/dialog"
import { Input } from "@/packages/ui/input"
import { Label } from "@/packages/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import type { ProjectServiceDetail, ServiceRuntime } from "../../types"
import { formatNumber } from "../service-formatters"

interface DeployRevisionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  submitting: boolean
  service: ProjectServiceDetail
  onSubmit: (payload: {
    modelVersionId: string
    runtime: ServiceRuntime
    resourceSpec: ProjectServiceDetail["resourceSpec"]
    autoscaling: ProjectServiceDetail["autoscaling"]
    strategy: "full" | "keep_zero" | "canary"
    canaryWeight?: number
  }) => Promise<void>
}

interface DeployDraftState {
  modelVersionId: string
  runtime: ServiceRuntime
  resourceSpec: ProjectServiceDetail["resourceSpec"]
  autoscaling: ProjectServiceDetail["autoscaling"]
  strategy: "full" | "keep_zero" | "canary"
  canaryWeight: number
}

function toDefaultState(service: ProjectServiceDetail): DeployDraftState {
  return {
    modelVersionId: service.modelVersionId,
    runtime: service.runtime,
    resourceSpec: { ...service.resourceSpec },
    autoscaling: { ...service.autoscaling },
    strategy: "canary",
    canaryWeight: 10,
  }
}

export function DeployRevisionDialog({
  open,
  onOpenChange,
  submitting,
  service,
  onSubmit,
}: DeployRevisionDialogProps) {
  const [state, setState] = useState<DeployDraftState>(() => toDefaultState(service))

  const diffBefore = useMemo(
    () => ({
      modelVersionId: service.modelVersionId,
      runtime: service.runtime,
      resourceSpec: service.resourceSpec,
      autoscaling: service.autoscaling,
    }),
    [service.autoscaling, service.modelVersionId, service.resourceSpec, service.runtime],
  )

  const diffAfter = useMemo(
    () => ({
      modelVersionId: state.modelVersionId,
      runtime: state.runtime,
      resourceSpec: state.resourceSpec,
      autoscaling: state.autoscaling,
    }),
    [state.autoscaling, state.modelVersionId, state.resourceSpec, state.runtime],
  )

  const steps = useMemo<WizardStep[]>(
    () => [
      {
        id: "model",
        title: "选择模型",
        validate: () => state.modelVersionId.trim().length > 0,
        content: (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>model_version_id</Label>
              <Input
                value={state.modelVersionId}
                onChange={(event) =>
                  setState((prev) => ({ ...prev, modelVersionId: event.target.value }))
                }
                placeholder="输入模型版本 ID"
              />
            </div>
            <p className="rounded-md border border-border/50 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              支持 Tag 解析后的 version_id。当前：{service.modelVersionId}
            </p>
          </div>
        ),
      },
      {
        id: "runtime",
        title: "Runtime",
        content: (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>运行时</Label>
              <Select
                value={state.runtime}
                onValueChange={(value) =>
                  setState((prev) => ({ ...prev, runtime: value as DeployDraftState["runtime"] }))
                }
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["vLLM", "TGI", "Triton", "HF"] as const).map((runtime) => (
                    <SelectItem key={runtime} value={runtime} className="cursor-pointer">
                      {runtime}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ),
      },
      {
        id: "resource",
        title: "资源与弹性",
        validate: () =>
          state.resourceSpec.gpuCount > 0 &&
          state.autoscaling.maxReplicas >= state.autoscaling.minReplicas,
        content: (
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label>GPU 型号</Label>
                <Input
                  value={state.resourceSpec.gpuModel}
                  onChange={(event) =>
                    setState((prev) => ({
                      ...prev,
                      resourceSpec: { ...prev.resourceSpec, gpuModel: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>GPU 数量</Label>
                <Input
                  type="number"
                  value={state.resourceSpec.gpuCount}
                  onChange={(event) =>
                    setState((prev) => ({
                      ...prev,
                      resourceSpec: { ...prev.resourceSpec, gpuCount: Number(event.target.value) },
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Min</Label>
                <Input
                  type="number"
                  value={state.autoscaling.minReplicas}
                  onChange={(event) =>
                    setState((prev) => ({
                      ...prev,
                      autoscaling: { ...prev.autoscaling, minReplicas: Number(event.target.value) },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Max</Label>
                <Input
                  type="number"
                  value={state.autoscaling.maxReplicas}
                  onChange={(event) =>
                    setState((prev) => ({
                      ...prev,
                      autoscaling: { ...prev.autoscaling, maxReplicas: Number(event.target.value) },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Delay(s)</Label>
                <Input
                  type="number"
                  value={state.autoscaling.scaleDownDelaySeconds}
                  onChange={(event) =>
                    setState((prev) => ({
                      ...prev,
                      autoscaling: {
                        ...prev.autoscaling,
                        scaleDownDelaySeconds: Number(event.target.value),
                      },
                    }))
                  }
                />
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "review",
        title: "Diff Review",
        content: (
          <DiffViewer
            before={diffBefore}
            after={diffAfter}
            beforeTitle="当前配置"
            afterTitle="新配置"
          />
        ),
      },
      {
        id: "strategy",
        title: "发布策略",
        content: (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>发布策略</Label>
              <Select
                value={state.strategy}
                onValueChange={(value) =>
                  setState((prev) => ({
                    ...prev,
                    strategy: value as DeployDraftState["strategy"],
                  }))
                }
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full" className="cursor-pointer">
                    立即 100% 切流
                  </SelectItem>
                  <SelectItem value="keep_zero" className="cursor-pointer">
                    创建后不切流（0%）
                  </SelectItem>
                  <SelectItem value="canary" className="cursor-pointer">
                    灰度发布
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {state.strategy === "canary" ? (
              <div className="space-y-2">
                <Label>灰度权重 (%)</Label>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={state.canaryWeight}
                  onChange={(event) =>
                    setState((prev) => ({
                      ...prev,
                      canaryWeight: Number(event.target.value),
                    }))
                  }
                />
              </div>
            ) : null}

            <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs text-primary">
              预计发布后：新 Revision 接入
              {state.strategy === "full"
                ? " 100% 流量"
                : state.strategy === "keep_zero"
                  ? " 0% 流量"
                  : ` ${formatNumber(state.canaryWeight, 0)}% 流量`}
              。
            </div>
          </div>
        ),
      },
    ],
    [diffAfter, diffBefore, service.modelVersionId, state],
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) {
          setState(toDefaultState(service))
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Deploy New Revision</DialogTitle>
        </DialogHeader>

        <Wizard
          steps={steps}
          isSubmitting={submitting}
          submitLabel="发布"
          onSubmit={async () => {
            await onSubmit({
              modelVersionId: state.modelVersionId,
              runtime: state.runtime,
              resourceSpec: state.resourceSpec,
              autoscaling: state.autoscaling,
              strategy: state.strategy,
              ...(state.strategy === "canary" ? { canaryWeight: state.canaryWeight } : {}),
            })
            onOpenChange(false)
          }}
        />

        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            className="cursor-pointer"
            onClick={() => {
              setState(toDefaultState(service))
            }}
          >
            重置为当前配置
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
