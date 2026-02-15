import { LoaderCircleIcon } from "lucide-react"
import type * as React from "react"
import { useCallback, useMemo, useState } from "react"
import { cn } from "@/packages/ui-utils"
import { Button } from "./button"
import { Steps, type StepsDirection, type StepsItem, type StepsStatus } from "./steps"

function clampStep(step: number, length: number) {
  if (length <= 0) {
    return 0
  }
  return Math.max(0, Math.min(step, length - 1))
}

export type WizardStepValidator = () => boolean | Promise<boolean>

export interface WizardStep {
  id: string
  title: React.ReactNode
  description?: React.ReactNode | undefined
  content: React.ReactNode
  validation?: WizardStepValidator | undefined
  status?: StepsStatus | undefined
  disabled?: boolean | undefined
}

export interface WizardProps extends Omit<React.ComponentProps<"div">, "onSubmit"> {
  steps: WizardStep[]
  initialStep?: number | undefined
  currentStep?: number | undefined
  onStepChange?: ((step: number) => void) | undefined
  onFinish?: (() => void | Promise<void>) | undefined
  validateStep?: ((step: number) => boolean | Promise<boolean>) | undefined
  nextLabel?: React.ReactNode | undefined
  previousLabel?: React.ReactNode | undefined
  finishLabel?: React.ReactNode | undefined
  submitting?: boolean | undefined
  finishDisabled?: boolean | undefined
  allowStepNavigation?: boolean | undefined
  direction?: StepsDirection | undefined
}

export function Wizard({
  steps,
  initialStep = 0,
  currentStep,
  onStepChange,
  onFinish,
  validateStep,
  nextLabel = "下一步",
  previousLabel = "上一步",
  finishLabel = "完成",
  submitting = false,
  finishDisabled = false,
  allowStepNavigation = true,
  direction = "horizontal",
  className,
  ...props
}: WizardProps) {
  const [internalStep, setInternalStep] = useState(() => clampStep(initialStep, steps.length))
  const [validating, setValidating] = useState(false)
  const [failedSteps, setFailedSteps] = useState<Record<number, boolean>>({})

  const activeStep = clampStep(currentStep ?? internalStep, steps.length)
  const isLastStep = activeStep === steps.length - 1
  const busy = validating || submitting

  const updateStep = useCallback(
    (nextStep: number) => {
      const safeStep = clampStep(nextStep, steps.length)
      if (currentStep === undefined) {
        setInternalStep(safeStep)
      }
      onStepChange?.(safeStep)
    },
    [currentStep, onStepChange, steps.length],
  )

  const runValidation = useCallback(
    async (stepIndex: number) => {
      const step = steps[stepIndex]
      if (!step) {
        return false
      }

      if (step.validation) {
        const localValid = await step.validation()
        if (!localValid) {
          return false
        }
      }

      if (!validateStep) {
        return true
      }

      return Boolean(await validateStep(stepIndex))
    },
    [steps, validateStep],
  )

  const markStepFailure = useCallback((stepIndex: number) => {
    setFailedSteps((current) => ({
      ...current,
      [stepIndex]: true,
    }))
  }, [])

  const clearStepFailure = useCallback((stepIndex: number) => {
    setFailedSteps((current) => {
      if (!current[stepIndex]) {
        return current
      }
      const next = { ...current }
      delete next[stepIndex]
      return next
    })
  }, [])

  const handlePrevious = () => {
    if (busy || activeStep <= 0) {
      return
    }
    updateStep(activeStep - 1)
  }

  const handleNext = async () => {
    if (busy || isLastStep) {
      return
    }
    setValidating(true)
    const valid = await runValidation(activeStep)
    setValidating(false)

    if (!valid) {
      markStepFailure(activeStep)
      return
    }

    clearStepFailure(activeStep)
    updateStep(activeStep + 1)
  }

  const handleFinish = async () => {
    if (busy || finishDisabled || !onFinish) {
      return
    }

    setValidating(true)
    const valid = await runValidation(activeStep)
    setValidating(false)

    if (!valid) {
      markStepFailure(activeStep)
      return
    }

    clearStepFailure(activeStep)
    await onFinish()
  }

  const stepsItems = useMemo<StepsItem[]>(
    () =>
      steps.map((step, index) => ({
        key: step.id,
        title: step.title,
        description: step.description,
        disabled: busy || step.disabled,
        status:
          step.status ??
          (failedSteps[index]
            ? "error"
            : index < activeStep
              ? "finish"
              : index === activeStep
                ? "process"
                : "wait"),
      })),
    [activeStep, busy, failedSteps, steps],
  )

  if (steps.length === 0) {
    return null
  }

  return (
    <div
      data-slot="wizard"
      className={cn("space-y-5 rounded-lg border border-border/50 bg-card p-5", className)}
      {...props}
    >
      <Steps
        items={stepsItems}
        current={activeStep}
        direction={direction}
        onStepChange={
          allowStepNavigation
            ? (nextStep) => {
                if (busy || nextStep > activeStep) {
                  return
                }
                updateStep(nextStep)
              }
            : undefined
        }
      />

      <div className="min-h-[280px]">
        {steps.map((step, index) => (
          <section
            key={step.id}
            aria-hidden={index !== activeStep}
            hidden={index !== activeStep}
            data-step-id={step.id}
          >
            {step.content}
          </section>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-border/50 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={busy || activeStep === 0}
          className="cursor-pointer"
        >
          {previousLabel}
        </Button>
        {isLastStep ? (
          <Button
            type="button"
            onClick={() => {
              void handleFinish()
            }}
            disabled={busy || finishDisabled}
            className="cursor-pointer"
          >
            {busy ? <LoaderCircleIcon aria-hidden className="size-4 animate-spin" /> : null}
            {finishLabel}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={() => {
              void handleNext()
            }}
            disabled={busy}
            className="cursor-pointer"
          >
            {busy ? <LoaderCircleIcon aria-hidden className="size-4 animate-spin" /> : null}
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
