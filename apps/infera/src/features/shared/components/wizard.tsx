import { Check, LoaderCircle } from "lucide-react"
import type * as React from "react"
import { useCallback, useMemo, useState } from "react"
import { Button } from "@/packages/ui/button"
import { cn } from "@/packages/ui-utils"

function clampStep(step: number, length: number) {
  if (length <= 0) {
    return 0
  }
  return Math.min(Math.max(step, 0), length - 1)
}

export type WizardStepValidator = () => boolean | Promise<boolean>

export interface WizardStep {
  id: string
  title: string
  description?: string
  content: React.ReactNode
  validate?: WizardStepValidator
}

export interface WizardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  steps: WizardStep[]
  initialStep?: number
  currentStep?: number
  onStepChange?: (step: number) => void
  validateStep?: (step: number) => boolean | Promise<boolean>
  onSubmit?: () => void | Promise<void>
  nextLabel?: string
  backLabel?: string
  submitLabel?: string
  isSubmitting?: boolean
  submitDisabled?: boolean
  disableStepNavigation?: boolean
}

export function useWizardValidation(validators: Array<WizardStepValidator | undefined>) {
  const validateStep = useCallback(
    async (step: number) => {
      const validator = validators[step]
      if (!validator) {
        return true
      }
      return Boolean(await validator())
    },
    [validators],
  )

  return { validateStep }
}

export function Wizard({
  steps,
  initialStep = 0,
  currentStep,
  onStepChange,
  validateStep,
  onSubmit,
  nextLabel = "下一步",
  backLabel = "上一步",
  submitLabel = "提交",
  isSubmitting = false,
  submitDisabled = false,
  disableStepNavigation = false,
  className,
  ...props
}: WizardProps) {
  const [internalStep, setInternalStep] = useState(() => clampStep(initialStep, steps.length))
  const [isValidating, setIsValidating] = useState(false)
  const activeStep = clampStep(currentStep ?? internalStep, steps.length)
  const step = steps[activeStep]

  const isLastStep = activeStep === steps.length - 1
  const isBusy = isValidating || isSubmitting

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

  const runStepValidation = useCallback(
    async (stepIndex: number) => {
      const current = steps[stepIndex]
      if (!current) {
        return false
      }

      if (current.validate) {
        const isLocalValid = await current.validate()
        if (!isLocalValid) {
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

  const handleBack = () => {
    if (isBusy || activeStep === 0) {
      return
    }
    updateStep(activeStep - 1)
  }

  const handleNext = async () => {
    if (isBusy || isLastStep) {
      return
    }

    setIsValidating(true)
    const valid = await runStepValidation(activeStep)
    setIsValidating(false)

    if (!valid) {
      return
    }

    updateStep(activeStep + 1)
  }

  const handleSubmit = async () => {
    if (isBusy || submitDisabled || !onSubmit) {
      return
    }

    setIsValidating(true)
    const valid = await runStepValidation(activeStep)
    setIsValidating(false)

    if (!valid) {
      return
    }

    await onSubmit()
  }

  const stepIndicators = useMemo(
    () =>
      steps.map((item, index) => {
        const isCompleted = index < activeStep
        const isCurrent = index === activeStep
        const clickable = !disableStepNavigation && index <= activeStep && !isBusy

        return {
          ...item,
          index,
          isCompleted,
          isCurrent,
          clickable,
        }
      }),
    [steps, activeStep, disableStepNavigation, isBusy],
  )

  if (!step) {
    return null
  }

  return (
    <div className={cn("rounded-lg border border-border/50 bg-card p-6", className)} {...props}>
      <ol className="flex flex-col gap-3 md:flex-row md:items-center">
        {stepIndicators.map((item, index) => (
          <li
            key={item.id}
            className={cn("flex items-center gap-3", index < steps.length - 1 ? "flex-1" : null)}
          >
            <button
              type="button"
              disabled={!item.clickable}
              onClick={() => updateStep(item.index)}
              className={cn(
                "flex min-w-0 items-center gap-2 text-left transition-colors",
                item.clickable ? "cursor-pointer hover:text-foreground" : "cursor-default",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded-full border text-xs font-medium",
                  item.isCompleted ? "border-primary bg-primary text-primary-foreground" : null,
                  item.isCurrent ? "border-2 border-primary text-primary" : null,
                  !item.isCompleted && !item.isCurrent
                    ? "border-border/60 bg-muted text-muted-foreground"
                    : null,
                )}
              >
                {item.isCompleted ? <Check className="size-4" aria-hidden /> : item.index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{item.title}</span>
                {item.description ? (
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.description}
                  </span>
                ) : null}
              </span>
            </button>
            {index < steps.length - 1 ? (
              <span
                className={cn(
                  "hidden h-0.5 flex-1 rounded-full md:block",
                  index < activeStep ? "bg-primary" : "bg-muted",
                )}
              />
            ) : null}
          </li>
        ))}
      </ol>

      <div className="mt-6 min-h-[400px]">{step.content}</div>

      <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={activeStep === 0 || isBusy}
          className="cursor-pointer"
        >
          {backLabel}
        </Button>

        {isLastStep ? (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isBusy || submitDisabled}
            className="cursor-pointer"
          >
            {isBusy ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
            {submitLabel}
          </Button>
        ) : (
          <Button type="button" onClick={handleNext} disabled={isBusy} className="cursor-pointer">
            {isBusy ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
