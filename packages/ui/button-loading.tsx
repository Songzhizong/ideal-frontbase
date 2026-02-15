import type * as React from "react"
import { useEffect, useState } from "react"
import { cn } from "@/packages/ui-utils"
import { Button, type ButtonProps } from "./button"
import { Spinner } from "./spinner"

type LoadingPosition = "start" | "center" | "end"

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "then" in value &&
    typeof (value as PromiseLike<unknown>).then === "function"
  )
}

export interface ButtonLoadingRenderContext {
  loading: boolean
}

export interface ButtonLoadingProps extends Omit<ButtonProps, "onClick" | "children"> {
  loading?: boolean | undefined
  autoLoading?: boolean | undefined
  loadingText?: React.ReactNode | undefined
  loadingDuration?: number | undefined
  loadingIcon?: React.ReactNode | undefined
  loadingPosition?: LoadingPosition | undefined
  leading?: React.ReactNode | undefined
  trailing?: React.ReactNode | undefined
  children?: React.ReactNode | ((context: ButtonLoadingRenderContext) => React.ReactNode)
  onClick?: ((event: React.MouseEvent<HTMLButtonElement>) => unknown) | undefined
}

export function ButtonLoading({
  loading,
  autoLoading = false,
  loadingText,
  loadingDuration,
  loadingIcon,
  loadingPosition = "start",
  leading,
  trailing,
  children,
  onClick,
  disabled,
  ...props
}: ButtonLoadingProps) {
  const [internalLoading, setInternalLoading] = useState(Boolean(loading))
  const isControlled = loading !== undefined

  useEffect(() => {
    if (isControlled) {
      setInternalLoading(Boolean(loading))
    }
  }, [isControlled, loading])

  const isLoading = isControlled ? Boolean(loading) : internalLoading

  const content = typeof children === "function" ? children({ loading: isLoading }) : children

  const resolvedLoadingIcon = loadingIcon ?? <Spinner className="size-4" />
  const resolvedDisabled = Boolean(disabled || isLoading)

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const clickResult = onClick?.(event)

    if (!autoLoading || event.defaultPrevented) {
      if (isPromiseLike(clickResult)) {
        await clickResult
      }
      return
    }

    setInternalLoading(true)
    const startAt = Date.now()

    try {
      if (isPromiseLike(clickResult)) {
        await clickResult
      }
    } finally {
      const minDuration = loadingDuration ?? 0
      const elapsed = Date.now() - startAt
      const remain = Math.max(0, minDuration - elapsed)

      if (remain > 0) {
        await new Promise<void>((resolve) => {
          setTimeout(resolve, remain)
        })
      }

      if (!isControlled) {
        setInternalLoading(false)
      }
    }
  }

  if (loadingPosition === "center") {
    return (
      <Button
        disabled={resolvedDisabled}
        onClick={(event) => {
          void handleClick(event)
        }}
        {...props}
      >
        <span className="relative inline-flex items-center justify-center">
          <span className={cn("inline-flex items-center gap-2", isLoading && "invisible")}>
            {content}
          </span>
          {isLoading ? (
            <span className="absolute inset-0 inline-flex items-center justify-center gap-1.5">
              {resolvedLoadingIcon}
              {loadingText ? <span>{loadingText}</span> : null}
            </span>
          ) : null}
        </span>
      </Button>
    )
  }

  return (
    <Button
      disabled={resolvedDisabled}
      onClick={(event) => {
        void handleClick(event)
      }}
      {...props}
    >
      {isLoading && loadingPosition === "start" ? resolvedLoadingIcon : leading}
      {content}
      {isLoading && loadingPosition === "end" ? resolvedLoadingIcon : trailing}
    </Button>
  )
}
