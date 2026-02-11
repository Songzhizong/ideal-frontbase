import { AlertTriangle, ShieldCheck } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"
import { Input } from "@/packages/ui/input"
import { Label } from "@/packages/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { Switch } from "@/packages/ui/switch"
import type {
  ServiceModelAssetOption,
  ServiceResourceProfileOption,
  ServiceRuntimeOption,
  ServiceWizardOptions,
} from "../types"
import type { CreateServiceWizardState } from "./create-service-wizard.state"

interface WizardSectionProps {
  state: CreateServiceWizardState
  setState: Dispatch<SetStateAction<CreateServiceWizardState>>
  options: ServiceWizardOptions | undefined
}

interface ConfirmStepSectionProps {
  state: CreateServiceWizardState
  selectedModel: ServiceModelAssetOption | null
  selectedRuntime: ServiceRuntimeOption | null
  selectedResourceProfile: ServiceResourceProfileOption | null
  prodScaleToZeroAllowed: boolean
}

export function ResourceStepSection({ state, setState, options }: WizardSectionProps) {
  const selectedProfile =
    options?.resourceProfiles.find((item) => item.profileId === state.resourceProfileId) ??
    options?.resourceProfiles[0] ??
    null

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>资源规格</Label>
        <Select
          value={state.resourceProfileId || selectedProfile?.profileId || ""}
          onValueChange={(value) => {
            const profile = options?.resourceProfiles.find((item) => item.profileId === value)
            if (!profile) {
              return
            }
            setState((prev) => ({
              ...prev,
              resourceProfileId: profile.profileId,
              gpuModel: profile.gpuModel,
              gpuCount: profile.gpuCount,
              cpuRequest: profile.cpuRequest,
              cpuLimit: profile.cpuLimit,
              memoryRequest: profile.memoryRequest,
              memoryLimit: profile.memoryLimit,
              estimatedMonthlyCost: profile.estimatedMonthlyCost,
            }))
          }}
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue placeholder="选择资源规格" />
          </SelectTrigger>
          <SelectContent>
            {options?.resourceProfiles.map((item) => (
              <SelectItem key={item.profileId} value={item.profileId} className="cursor-pointer">
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedProfile ? (
        <div className="space-y-4 rounded-lg border border-border/50 bg-card p-4">
          <div className="grid gap-3 text-sm lg:grid-cols-3">
            <p>
              GPU：{selectedProfile.gpuCount}x {selectedProfile.gpuModel}
            </p>
            <p>
              CPU：{selectedProfile.cpuRequest} / {selectedProfile.cpuLimit}
            </p>
            <p>
              内存：{selectedProfile.memoryRequest} / {selectedProfile.memoryLimit}
            </p>
          </div>
          <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary">
            预估月成本：{selectedProfile.estimatedMonthlyCost}
          </div>
          {selectedProfile.riskHints.length > 0 ? (
            <div className="rounded-md border border-orange-500/30 bg-orange-500/10 p-3 text-xs text-orange-500">
              <div className="mb-2 flex items-center gap-1 font-medium">
                <AlertTriangle className="size-3.5" />
                资源风险提示
              </div>
              <ul className="space-y-1">
                {selectedProfile.riskHints.map((hint) => (
                  <li key={hint}>• {hint}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export function AutoscalingStepSection({ state, setState, options }: WizardSectionProps) {
  const scaleToZeroDisabled =
    state.env === "Prod" && options?.prodPolicy.scaleToZeroAllowed === false

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2">
          <Label>扩缩容指标</Label>
          <Select
            value={state.autoscalingMetric}
            onValueChange={(value) =>
              setState((prev) => ({
                ...prev,
                autoscalingMetric: value as CreateServiceWizardState["autoscalingMetric"],
              }))
            }
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Concurrency" className="cursor-pointer">
                Concurrency
              </SelectItem>
              <SelectItem value="QPS" className="cursor-pointer">
                QPS
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Min Replicas</Label>
          <Input
            type="number"
            value={state.minReplicas}
            onChange={(event) =>
              setState((prev) => ({ ...prev, minReplicas: Number(event.target.value) }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Max Replicas</Label>
          <Input
            type="number"
            value={state.maxReplicas}
            onChange={(event) =>
              setState((prev) => ({ ...prev, maxReplicas: Number(event.target.value) }))
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Scale-down Delay（秒）</Label>
        <Input
          type="number"
          value={state.scaleDownDelaySeconds}
          onChange={(event) =>
            setState((prev) => ({ ...prev, scaleDownDelaySeconds: Number(event.target.value) }))
          }
        />
      </div>

      <div className="rounded-lg border border-border/50 bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Scale-to-Zero</p>
            <p className="text-xs text-muted-foreground">
              开启后低峰可缩到 0，首个请求可能需要 30s-2min 冷启动。
            </p>
          </div>
          <Switch
            checked={state.scaleToZero}
            disabled={scaleToZeroDisabled}
            onCheckedChange={(checked) => setState((prev) => ({ ...prev, scaleToZero: checked }))}
          />
        </div>
      </div>

      {scaleToZeroDisabled ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
          {options?.prodPolicy.note || "Prod 环境不允许 Scale-to-zero。"}
        </div>
      ) : null}
    </div>
  )
}

export function ConfirmStepSection({
  state,
  selectedModel,
  selectedRuntime,
  selectedResourceProfile,
  prodScaleToZeroAllowed,
}: ConfirmStepSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-lg border border-border/50 bg-card p-4 lg:grid-cols-2">
        <SummaryItem label="服务名称" value={state.name} />
        <SummaryItem label="环境" value={state.env} />
        <SummaryItem label="网络" value={state.networkExposure} />
        <SummaryItem label="API 协议" value="OpenAI-compatible" />
        <SummaryItem label="model_id" value={state.modelId} />
        <SummaryItem label="model_tag" value={state.modelTag} />
        <SummaryItem label="resolved version_id" value={state.resolvedModelVersionId} mono />
        <SummaryItem label="Runtime" value={state.runtime} />
        <SummaryItem label="资源规格" value={selectedResourceProfile?.label ?? "-"} />
        <SummaryItem
          label="Autoscaling"
          value={`${state.autoscalingMetric} · ${state.minReplicas}-${state.maxReplicas}`}
        />
      </div>

      <div className="rounded-lg border border-border/50 bg-muted/20 p-4 text-xs text-muted-foreground">
        <p>
          模型：{selectedModel?.modelName ?? "-"} · Runtime：{selectedRuntime?.label ?? "-"} ·
          预计成本：{selectedResourceProfile?.estimatedMonthlyCost ?? "-"}
        </p>
      </div>

      {state.env === "Prod" && !prodScaleToZeroAllowed ? (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs text-primary">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="size-4" />
            Prod 策略门禁生效
          </div>
          <p className="mt-1">该服务将自动关闭 Scale-to-Zero，确保生产稳定性。</p>
        </div>
      ) : null}
    </div>
  )
}

function SummaryItem({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={mono ? "font-mono text-xs" : "text-sm"}>{value || "-"}</p>
    </div>
  )
}
