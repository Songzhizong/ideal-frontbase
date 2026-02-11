import { useMemo, useState } from "react"
import { Wizard, type WizardStep } from "@/features/shared/components"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/packages/ui/dialog"
import type { CreateFineTuningJobInput, FineTuningWizardOptions } from "../types"
import { type CreateJobWizardState, INITIAL_CREATE_JOB_STATE } from "./create-job-wizard.state"
import {
  BaseModelStepSection,
  ConfirmStepSection,
  DatasetStepSection,
  ResourceCostStepSection,
  TrainingConfigStepSection,
} from "./create-job-wizard-sections"

interface CreateFineTuningJobWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
  projectId: string
  options: FineTuningWizardOptions | undefined
  submitting: boolean
  onSubmit: (input: CreateFineTuningJobInput) => Promise<void>
}

function isTrainingConfigValid(state: CreateJobWizardState) {
  return (
    state.epochs > 0 &&
    state.batchSize > 0 &&
    state.learningRate >= 0.000001 &&
    state.learningRate <= 0.01
  )
}

export function CreateFineTuningJobWizard({
  open,
  onOpenChange,
  tenantId,
  projectId,
  options,
  submitting,
  onSubmit,
}: CreateFineTuningJobWizardProps) {
  const [state, setState] = useState<CreateJobWizardState>(INITIAL_CREATE_JOB_STATE)
  const selectedResource =
    options?.resources.find((item) => item.resourceId === state.resourceId) ?? null

  const steps = useMemo<WizardStep[]>(
    () => [
      {
        id: "base-model",
        title: "选择基座模型",
        validate: () =>
          state.baseModelVersionId.length > 0 && state.outputModelName.trim().length >= 2,
        content: <BaseModelStepSection state={state} setState={setState} options={options} />,
      },
      {
        id: "dataset",
        title: "选择训练数据",
        validate: () => state.datasetVersionId.length > 0,
        content: <DatasetStepSection state={state} setState={setState} options={options} />,
      },
      {
        id: "config",
        title: "训练配置",
        validate: () => isTrainingConfigValid(state),
        content: <TrainingConfigStepSection state={state} setState={setState} />,
      },
      {
        id: "resource",
        title: "资源与成本",
        validate: () => state.resourceId.length > 0,
        content: <ResourceCostStepSection state={state} setState={setState} options={options} />,
      },
      {
        id: "confirm",
        title: "确认提交",
        content: (
          <ConfirmStepSection
            state={state}
            resourceLabel={selectedResource?.label ?? "未选择"}
            resourceCost={selectedResource?.estimatedCostRange ?? "-"}
          />
        ),
      },
    ],
    [options, selectedResource?.estimatedCostRange, selectedResource?.label, state],
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen)
        if (!nextOpen) {
          setState(INITIAL_CREATE_JOB_STATE)
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>创建微调任务</DialogTitle>
        </DialogHeader>
        <Wizard
          steps={steps}
          submitLabel="提交任务"
          isSubmitting={submitting}
          submitDisabled={
            !options ||
            state.baseModelVersionId.length === 0 ||
            state.datasetVersionId.length === 0 ||
            state.resourceId.length === 0 ||
            state.jobName.trim().length < 2
          }
          onSubmit={async () => {
            if (!selectedResource) {
              return
            }
            const payload: CreateFineTuningJobInput = {
              tenantId,
              projectId,
              jobName: state.jobName.trim(),
              baseModelVersionId: state.baseModelVersionId,
              baseModelTag: state.baseModelTag,
              datasetVersionId: state.datasetVersionId,
              trainingType: state.trainingType,
              epochs: state.epochs,
              batchSize: state.batchSize,
              learningRate: state.learningRate,
              advancedConfig: {
                gradientAccumulation: state.gradientAccumulation,
                warmupSteps: state.warmupSteps,
                weightDecay: state.weightDecay,
                ...(state.trainingType === "LoRA"
                  ? {
                      loraR: state.loraR,
                      loraAlpha: state.loraAlpha,
                      loraDropout: state.loraDropout,
                    }
                  : {}),
              },
              resourceId: state.resourceId,
              resourcePool: selectedResource.resourcePool,
              estimatedGpuHours: selectedResource.estimatedGpuHours,
              estimatedCostRange: selectedResource.estimatedCostRange,
              outputModelName:
                state.outputModelName.trim() || `${projectId}-${state.jobName.trim()}`,
              artifactType: state.artifactType,
            }

            const normalizedBudgetLimit = state.budgetLimit.trim()
            if (normalizedBudgetLimit.length > 0) {
              payload.budgetLimit = normalizedBudgetLimit
            }

            await onSubmit(payload)
            onOpenChange(false)
            setState(INITIAL_CREATE_JOB_STATE)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
