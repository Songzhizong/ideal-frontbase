import { Info, Sparkles } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"
import { Badge } from "@/packages/ui/badge"
import { Input } from "@/packages/ui/input"
import { Label } from "@/packages/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/packages/ui/select"
import { Textarea } from "@/packages/ui/textarea"
import type { ServiceModelAssetOption, ServiceWizardOptions } from "../types"
import type { CreateServiceWizardState } from "./create-service-wizard.state"
import { formatNumber, isCidrFormat } from "./service-formatters"

interface WizardSectionProps {
  state: CreateServiceWizardState
  setState: Dispatch<SetStateAction<CreateServiceWizardState>>
  options: ServiceWizardOptions | undefined
}

export function BaseInfoStepSection({ state, setState, options }: WizardSectionProps) {
  const allowlistRows = state.ipAllowlistInput
    .split(/\n|,|;/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)

  const invalidRows = allowlistRows.filter((item) => !isCidrFormat(item))

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <Label>服务名称</Label>
          <Input
            placeholder="例如：chat-completion"
            value={state.name}
            onChange={(event) => setState((prev) => ({ ...prev, name: event.target.value }))}
          />
          <p className="text-xs text-muted-foreground">2-64 位，小写字母/数字/中划线。</p>
        </div>

        <div className="space-y-2">
          <Label>环境</Label>
          <Select
            value={state.env}
            onValueChange={(value) =>
              setState((prev) => ({ ...prev, env: value as CreateServiceWizardState["env"] }))
            }
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(options?.environmentOptions ?? ["Dev", "Test", "Prod"]).map((env) => (
                <SelectItem key={env} value={env} className="cursor-pointer">
                  {env}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>描述（可选）</Label>
        <Textarea
          rows={3}
          placeholder="描述该服务用途、调用方和流量特征。"
          value={state.description}
          onChange={(event) => setState((prev) => ({ ...prev, description: event.target.value }))}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <Label>网络暴露</Label>
          <Select
            value={state.networkExposure}
            onValueChange={(value) =>
              setState((prev) => ({
                ...prev,
                networkExposure: value as CreateServiceWizardState["networkExposure"],
              }))
            }
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Private" className="cursor-pointer">
                Private
              </SelectItem>
              <SelectItem value="Public" className="cursor-pointer">
                Public
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>API 协议</Label>
          <div className="rounded-md border border-border/50 bg-muted/20 px-3 py-2 text-sm">
            OpenAI-compatible
          </div>
        </div>
      </div>

      {state.networkExposure === "Public" ? (
        <div className="space-y-2">
          <Label>IP Allowlist（CIDR）</Label>
          <Textarea
            rows={4}
            placeholder="例如：10.0.0.0/16, 172.20.4.0/24"
            value={state.ipAllowlistInput}
            onChange={(event) =>
              setState((prev) => ({ ...prev, ipAllowlistInput: event.target.value }))
            }
          />
          {invalidRows.length > 0 ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              无效 CIDR：{invalidRows.join("、")}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">支持多行或逗号分隔。</p>
          )}
        </div>
      ) : null}
    </div>
  )
}

export function ModelStepSection({ state, setState, options }: WizardSectionProps) {
  const selectedModel =
    options?.modelAssets.find((item) => item.modelId === state.modelId) ??
    options?.modelAssets[0] ??
    null

  const selectedTag = state.modelTag || selectedModel?.defaultTag || "latest"
  const resolvedVersionId =
    selectedModel?.resolvedVersionMap[selectedTag] ?? state.resolvedModelVersionId

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <Label>选择模型资产</Label>
          <Select
            value={state.modelId || selectedModel?.modelId || ""}
            onValueChange={(value) => {
              const model = options?.modelAssets.find((item) => item.modelId === value)
              if (!model) {
                return
              }
              setState((prev) => ({
                ...prev,
                modelId: model.modelId,
                modelTag: model.defaultTag,
                resolvedModelVersionId: model.resolvedVersionMap[model.defaultTag] ?? "",
              }))
            }}
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue placeholder="选择模型" />
            </SelectTrigger>
            <SelectContent>
              {options?.modelAssets.map((item) => (
                <SelectItem key={item.modelId} value={item.modelId} className="cursor-pointer">
                  {item.modelName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tag / Version</Label>
          <Select
            value={selectedTag}
            onValueChange={(value) => {
              if (!selectedModel) {
                return
              }
              setState((prev) => ({
                ...prev,
                modelTag: value,
                resolvedModelVersionId: selectedModel.resolvedVersionMap[value] ?? "",
              }))
            }}
          >
            <SelectTrigger className="cursor-pointer">
              <SelectValue placeholder="选择 Tag" />
            </SelectTrigger>
            <SelectContent>
              {(selectedModel?.tagOptions ?? []).map((tag) => (
                <SelectItem key={tag} value={tag} className="cursor-pointer">
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border border-border/50 bg-card p-4">
        <p className="mb-1 text-xs text-muted-foreground">解析后 model_version_id</p>
        <p className="font-mono text-xs text-foreground">
          {resolvedVersionId || "请先选择模型和 Tag"}
        </p>
      </div>

      {selectedModel ? <ModelMetadataCard selectedModel={selectedModel} /> : null}
    </div>
  )
}

function ModelMetadataCard({ selectedModel }: { selectedModel: ServiceModelAssetOption }) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium">模型 metadata</p>
        <Badge variant="outline" className="capitalize">
          {selectedModel.owner}
        </Badge>
      </div>
      <div className="grid gap-2 text-xs text-muted-foreground lg:grid-cols-4">
        <p>参数量：{selectedModel.metadata.parameterSize}</p>
        <p>上下文：{formatNumber(selectedModel.metadata.contextLength, 0)}</p>
        <p>License：{selectedModel.metadata.license}</p>
        <p>量化：{selectedModel.metadata.quantization}</p>
      </div>
    </div>
  )
}

export function RuntimeStepSection({ state, setState, options }: WizardSectionProps) {
  const selectedRuntime =
    options?.runtimeOptions.find((item) => item.runtime === state.runtime) ??
    options?.runtimeOptions[0] ??
    null

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Runtime</Label>
        <Select
          value={state.runtime}
          onValueChange={(value) => {
            const runtime = options?.runtimeOptions.find((item) => item.runtime === value)
            setState((prev) => ({
              ...prev,
              runtime: value as CreateServiceWizardState["runtime"],
              runtimeParams: runtime ? { ...runtime.defaultParams } : prev.runtimeParams,
            }))
          }}
        >
          <SelectTrigger className="cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options?.runtimeOptions.map((item) => (
              <SelectItem key={item.runtime} value={item.runtime} className="cursor-pointer">
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedRuntime ? (
        <div className="rounded-lg border border-border/50 bg-card p-4">
          <div className="flex items-start gap-2 text-sm">
            <Sparkles className="mt-0.5 size-4 text-primary" />
            <p>{selectedRuntime.recommendation}</p>
          </div>
        </div>
      ) : null}

      <div className="space-y-3 rounded-lg border border-border/50 bg-card p-4">
        <p className="text-sm font-medium">Runtime 参数（高级）</p>
        {Object.entries(state.runtimeParams).map(([key, value]) => (
          <div key={key} className="grid gap-2 lg:grid-cols-[200px_1fr] lg:items-center">
            <Label className="text-xs text-muted-foreground">{key}</Label>
            <Input
              value={value}
              onChange={(event) =>
                setState((prev) => ({
                  ...prev,
                  runtimeParams: {
                    ...prev.runtimeParams,
                    [key]: event.target.value,
                  },
                }))
              }
            />
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border/50 bg-primary/5 p-3 text-xs text-primary">
        <div className="mb-1 flex items-center gap-2">
          <Info className="size-4" />
          Runtime 参数将写入新 Revision 的配置快照。
        </div>
      </div>
    </div>
  )
}
