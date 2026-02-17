import { Button, type ButtonProps } from "@/packages/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/packages/ui/tooltip"
import { cn } from "@/packages/ui-utils"
import { useAuthStore } from "./auth-store"
import type { Permission } from "./types"

interface AuthButtonProps extends ButtonProps {
  permission: Permission | Permission[]
  mode?: "AND" | "OR"
  showTooltip?: boolean
  tooltipContent?: string
  /** Tooltip preferred side (top, right, bottom, left). Defaults to 'top'. */
  tooltipSide?: "top" | "right" | "bottom" | "left"
  /** Tooltip alignment (start, center, end). Defaults to 'center'. */
  tooltipAlign?: "start" | "center" | "end"
}

/**
 * AuthButton - 权限感知的按钮组件
 *
 * 如果用户没有权限，按钮会自动置灰并显示 Tooltip (可选)
 */
export function AuthButton({
  permission,
  mode = "OR",
  showTooltip = true,
  tooltipContent = "您没有权限执行此操作",
  tooltipSide = "top",
  tooltipAlign = "center",
  className,
  disabled,
  children,
  ...props
}: AuthButtonProps) {
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const isAllowed = hasPermission(permission, mode)

  const button = (
    <Button
      {...props}
      disabled={disabled || !isAllowed}
      className={cn(className, !isAllowed && "cursor-not-allowed")}
    >
      {children}
    </Button>
  )

  if (!isAllowed && showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block">{button}</span>
          </TooltipTrigger>
          <TooltipContent side={tooltipSide} align={tooltipAlign}>
            <p>{tooltipContent}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return button
}
