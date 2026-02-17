import { StarIcon } from "lucide-react"
import type * as React from "react"
import { useState } from "react"
import { cn } from "@/packages/ui-utils"

export interface RateProps extends Omit<React.ComponentProps<"div">, "onChange"> {
  value?: number | undefined
  defaultValue?: number | undefined
  onChange?: ((value: number) => void) | undefined
  count?: number | undefined
  allowHalf?: boolean | undefined
  allowClear?: boolean | undefined
  disabled?: boolean | undefined
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function resolveNextValue(
  event: React.MouseEvent<HTMLButtonElement>,
  index: number,
  allowHalf: boolean,
) {
  if (!allowHalf) {
    return index + 1
  }
  const rect = event.currentTarget.getBoundingClientRect()
  const isHalf = event.clientX - rect.left <= rect.width / 2
  return isHalf ? index + 0.5 : index + 1
}

export function Rate({
  value,
  defaultValue = 0,
  onChange,
  count = 5,
  allowHalf = false,
  allowClear = true,
  disabled = false,
  className,
  ...props
}: RateProps) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const isControlled = value !== undefined
  const resolvedValue = isControlled ? value : internalValue
  const displayValue = hoverValue ?? resolvedValue

  const updateValue = (nextValue: number) => {
    const safeValue = clamp(nextValue, 0, count)
    if (!isControlled) {
      setInternalValue(safeValue)
    }
    onChange?.(safeValue)
  }

  return (
    <div
      data-slot="rate"
      className={cn("inline-flex items-center gap-1", disabled ? "opacity-60" : "", className)}
      aria-disabled={disabled}
      {...props}
    >
      {Array.from({ length: count }).map((_, index) => {
        const starValue = index + 1
        const halfValue = index + 0.5
        const fullFilled = displayValue >= starValue
        const halfFilled = !fullFilled && allowHalf && displayValue >= halfValue

        return (
          <button
            key={`rate-${starValue}`}
            type="button"
            disabled={disabled}
            className="group relative inline-flex size-6 cursor-pointer items-center justify-center disabled:cursor-not-allowed"
            aria-label={`${starValue} 星`}
            onMouseEnter={() => {
              if (disabled) {
                return
              }
              setHoverValue(starValue)
            }}
            onMouseMove={(event) => {
              if (disabled || !allowHalf) {
                return
              }
              const nextValue = resolveNextValue(event, index, allowHalf)
              setHoverValue(nextValue)
            }}
            onMouseLeave={() => {
              setHoverValue(null)
            }}
            onClick={(event) => {
              if (disabled) {
                return
              }
              const nextValue = resolveNextValue(event, index, allowHalf)
              if (allowClear && nextValue === resolvedValue) {
                updateValue(0)
                return
              }
              updateValue(nextValue)
            }}
            onKeyDown={(event) => {
              if (disabled) {
                return
              }
              if (event.key === "ArrowRight" || event.key === "ArrowUp") {
                event.preventDefault()
                const step = allowHalf ? 0.5 : 1
                updateValue(resolvedValue + step)
                return
              }
              if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
                event.preventDefault()
                const step = allowHalf ? 0.5 : 1
                updateValue(resolvedValue - step)
              }
            }}
          >
            <div className="relative size-5">
              <StarIcon
                aria-hidden
                className={cn(
                  "size-5",
                  fullFilled ? "fill-warning text-warning" : "text-muted-foreground",
                )}
              />
              {halfFilled && (
                <div className="absolute top-0 left-0 h-full w-1/2 overflow-hidden">
                  <StarIcon aria-hidden className="size-5 fill-warning text-warning" />
                </div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
