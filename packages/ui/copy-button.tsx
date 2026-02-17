import { CheckIcon, CopyIcon } from "lucide-react"
import type * as React from "react"
import { useCopy } from "@/packages/hooks-core"
import { cn } from "@/packages/ui-utils"
import { Button, type ButtonProps } from "./button"

export interface CopyButtonProps extends Omit<ButtonProps, "onCopy"> {
  value: string
  timeout?: number | undefined
  onCopy?: ((value: string, copied: boolean) => void | Promise<void>) | undefined
  copyLabel?: React.ReactNode | undefined
  copiedLabel?: React.ReactNode | undefined
  iconOnly?: boolean | undefined
}

export function CopyButton({
  value,
  timeout,
  onCopy,
  copyLabel = "复制",
  copiedLabel = "已复制",
  iconOnly = false,
  className,
  onClick,
  children,
  disabled,
  type = "button",
  ...props
}: CopyButtonProps) {
  const { copy, copied } = useCopy({ timeout })

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (event.defaultPrevented || disabled) {
      return
    }
    const isCopied = await copy(value, { timeout })
    await onCopy?.(value, isCopied)
  }

  const displayLabel = copied ? copiedLabel : copyLabel
  const displayContent = children ?? displayLabel

  return (
    <Button
      type={type}
      className={cn("cursor-pointer", className)}
      onClick={(event) => {
        void handleClick(event)
      }}
      disabled={disabled}
      aria-label={typeof displayLabel === "string" ? displayLabel : undefined}
      {...props}
    >
      {copied ? (
        <CheckIcon aria-hidden className="size-4" />
      ) : (
        <CopyIcon aria-hidden className="size-4" />
      )}
      {iconOnly ? <span className="sr-only">{displayLabel}</span> : displayContent}
    </Button>
  )
}

export interface CopyTextProps extends Omit<React.ComponentProps<"div">, "onCopy"> {
  value: string
  text?: React.ReactNode | undefined
  timeout?: number | undefined
  onCopy?: ((value: string, copied: boolean) => void | Promise<void>) | undefined
  truncate?: boolean | undefined
  textClassName?: string | undefined
  buttonClassName?: string | undefined
}

export function CopyText({
  value,
  text,
  timeout,
  onCopy,
  truncate = true,
  textClassName,
  buttonClassName,
  className,
  ...props
}: CopyTextProps) {
  return (
    <div
      data-slot="copy-text"
      className={cn("inline-flex min-w-0 items-center gap-1.5", className)}
      {...props}
    >
      <span
        className={cn(
          "min-w-0 text-sm text-foreground",
          truncate ? "truncate" : "break-all",
          textClassName,
        )}
      >
        {text ?? value}
      </span>
      <CopyButton
        value={value}
        timeout={timeout}
        onCopy={onCopy}
        variant="ghost"
        size="md"
        shape="square"
        iconOnly
        className={cn("shrink-0", buttonClassName)}
      />
    </div>
  )
}
