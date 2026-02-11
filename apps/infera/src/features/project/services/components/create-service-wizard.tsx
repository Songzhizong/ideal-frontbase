import { useEffect, useMemo, useState } from "react"
import { Wizard, type WizardStep } from "@/features/shared/components"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/packages/ui/dialog"
import type { CreateServiceInput, ServiceWizardOptions } from "../types"
import {
  type CreateServiceWizardState,
  INITIAL_CREATE_SERVICE_WIZARD_STATE,
  splitAllowlist,
} from "./create-service-wizard.state"
import {
  AutoscalingStepSection,
  BaseInfoStepSection,
  ConfirmStepSection,
  ModelStepSection,
  ResourceStepSection,
  RuntimeStepSection,
} from "./create-service-wizard-sections"
import { isCidrFormat } from "./service-formatters"

interface CreateServiceWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  projectId: string
  options: ServiceWizardOptions | undefined
  submitting: boolean
  onSubmit: (payload: CreateServiceInput) => Promise<void>
}

function buildInitialState(options: ServiceWizardOptions | undefined): CreateServiceWizardState {
  const model = options?.modelAssets[0]
  const runtime = options?.runtimeOptions[0]
  const resource = options?.resourceProfiles[0]

  return {
    ...INITIAL_CREATE_SERVICE_WIZARD_STATE,
    env: options?.environmentOptions[0] ?? "Dev",
    modelId: model?.modelId ?? "",
    modelTag: model?.defaultTag ?? "latest",
    resolvedModelVersionId: model ? (model.resolvedVersionMap[model.defaultTag] ?? "") : "",
    runtime: runtime?.runtime ?? "vLLM",
    runtimeParams: runtime ? { ...runtime.defaultParams } : {},
    resourceProfileId: resource?.profileId ?? "",
    gpuModel: resource?.gpuModel ?? "A10",
    gpuCount: resource?.gpuCount ?? 1,
    cpuRequest: resource?.cpuRequest ?? "4",
    cpuLimit: resource?.cpuLimit ?? "8",
    memoryRequest: resource?.memoryRequest ?? "16Gi",
    memoryLimit: resource?.memoryLimit ?? "32Gi",
    estimatedMonthlyCost: resource?.estimatedMonthlyCost ?? "-",
  }
}

function hasValidAllowlist(state: CreateServiceWizardState) {
  if (state.networkExposure !== "Public") {
    return true
  }
  const items = splitAllowlist(state.ipAllowlistInput)
  return items.every((item) => isCidrFormat(item))
}

function isBaseInfoValid(state: CreateServiceWizardState) {
  return (
    /^[a-z0-9-]{2,64}$/.test(state.name.trim()) &&
    state.description.length <= 240 &&
    hasValidAllowlist(state)
  )
}

function isModelValid(state: CreateServiceWizardState) {
  return (
    state.modelId.length > 0 && state.modelTag.length > 0 && state.resolvedModelVersionId.length > 0
  )
}

function isResourceValid(state: CreateServiceWizardState) {
  return (
    state.resourceProfileId.length > 0 &&
    state.gpuCount > 0 &&
    state.cpuRequest.trim().length > 0 &&
    state.cpuLimit.trim().length > 0 &&
    state.memoryRequest.trim().length > 0 &&
    state.memoryLimit.trim().length > 0
  )
}

function isAutoscalingValid(state: CreateServiceWizardState) {
  return (
    state.minReplicas >= 0 &&
    state.maxReplicas >= state.minReplicas &&
    state.scaleDownDelaySeconds >= 0
  )
}

export function CreateServiceWizard({
  open,
  onOpenChange,
  tenantId,
  projectId,
  options,
  submitting,
  onSubmit,
}: CreateServiceWizardProps) {
  const [state, setState] = useState<CreateServiceWizardState>(() => buildInitialState(options))

  useEffect(() => {
    if (open) {
      setState(buildInitialState(options))
    }
  }, [open, options])

  const selectedModel =
    options?.modelAssets.find((item) => item.modelId === state.modelId) ??
    options?.modelAssets[0] ??
    null
  const selectedRuntime =
    options?.runtimeOptions.find((item) => item.runtime === state.runtime) ??
    options?.runtimeOptions[0] ??
    null
  const selectedResourceProfile =
    options?.resourceProfiles.find((item) => item.profileId === state.resourceProfileId) ??
    options?.resourceProfiles[0] ??
    null

  const steps = useMemo<WizardStep[]>(
    () => [
      {
        id: "base-info",
        title: "基础信息",
        validate: () => isBaseInfoValid(state),
        content: <BaseInfoStepSection state={state} setState={setState} options={options} />,
      },
      {
        id: "model",
        title: "选择模型",
        validate: () => isModelValid(state),
        content: <ModelStepSection state={state} setState={setState} options={options} />,
      },
      {
        id: "runtime",
        title: "Runtime",
        validate: () => state.runtime.length > 0,
        content: <RuntimeStepSection state={state} setState={setState} options={options} />,
      },
      {
        id: "resource",
        title: "资源规格",
        validate: () => isResourceValid(state),
        content: <ResourceStepSection state={state} setState={setState} options={options} />,
      },
      {
        id: "autoscaling",
        title: "弹性伸缩",
        validate: () => isAutoscalingValid(state),
        content: <AutoscalingStepSection state={state} setState={setState} options={options} />,
      },
      {
        id: "confirm",
        title: "确认创建",
        content: (
          <ConfirmStepSection
            state={state}
            selectedModel={selectedModel}
            selectedRuntime={selectedRuntime}
            selectedResourceProfile={selectedResourceProfile}
            prodScaleToZeroAllowed={options?.prodPolicy.scaleToZeroAllowed ?? true}
          />
        ),
      },
    ],
    [options, selectedModel, selectedResourceProfile, selectedRuntime, state],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>创建推理服务</DialogTitle>
        </DialogHeader>

        <Wizard
          steps={steps}
          submitLabel="创建服务"
          isSubmitting={submitting}
          submitDisabled={!options || !isBaseInfoValid(state) || !isModelValid(state)}
          onSubmit={async () => {
            if (!selectedResourceProfile) {
              return
            }

            const payload: CreateServiceInput = {
              tenantId,
              projectId,
              name: state.name.trim(),
              description: state.description.trim(),
              env: state.env,
              networkExposure: state.networkExposure,
              ipAllowlist:
                state.networkExposure === "Public" ? splitAllowlist(state.ipAllowlistInput) : [],
              apiProtocol: "OpenAI-compatible",
              modelId: state.modelId,
              modelTag: state.modelTag,
              resolvedModelVersionId: state.resolvedModelVersionId,
              runtime: state.runtime,
              runtimeParams: state.runtimeParams,
              resourceProfileId: state.resourceProfileId,
              gpuModel: state.gpuModel,
              gpuCount: state.gpuCount,
              cpuRequest: state.cpuRequest,
              cpuLimit: state.cpuLimit,
              memoryRequest: state.memoryRequest,
              memoryLimit: state.memoryLimit,
              autoscalingMetric: state.autoscalingMetric,
              minReplicas: state.minReplicas,
              maxReplicas: state.maxReplicas,
              scaleDownDelaySeconds: state.scaleDownDelaySeconds,
              scaleToZero:
                state.env === "Prod" && options?.prodPolicy.scaleToZeroAllowed === false
                  ? false
                  : state.scaleToZero,
              estimatedMonthlyCost: selectedResourceProfile.estimatedMonthlyCost,
            }

            await onSubmit(payload)
            onOpenChange(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
