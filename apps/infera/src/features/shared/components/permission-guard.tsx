import * as React from "react"
import type { ProdRestrictionOptions } from "@/features/core/auth/use-permission"
import { usePermission } from "@/features/core/auth/use-permission"
import type { Permission } from "@/packages/auth-core"
import { AuthButton, PermissionGate } from "@/packages/auth-core"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/packages/ui/tooltip"
import { cn } from "@/packages/ui-utils"

export interface PermissionGuardProps {
  permission: Permission | readonly Permission[]
  mode?: "AND" | "OR"
  whenUnauthorized?: "hide" | "disable"
  tooltipContent?: string
  fallback?: React.ReactNode
  prodRestriction?: ProdRestrictionOptions
  children: React.ReactNode
}

const DEFAULT_NO_PERMISSION_TEXT = "您没有权限执行此操作"
const DEFAULT_PROD_RESTRICTION_TEXT = "生产环境策略限制当前操作。"
const DISABLED_STYLE = "pointer-events-none cursor-not-allowed opacity-50"

function normalizePermissionInput(
  permission: Permission | readonly Permission[],
): Permission | Permission[] {
  if (typeof permission === "string") {
    return permission
  }

  return [...permission]
}

function getElementClassName(element: React.ReactElement) {
  if (typeof element.props !== "object" || element.props === null) {
    return undefined
  }

  if (!("className" in element.props)) {
    return undefined
  }

  const { className } = element.props as { className?: unknown }
  return typeof className === "string" ? className : undefined
}

function supportsDisabledProp(element: React.ReactElement) {
  if (typeof element.type !== "string") {
    return true
  }

  return ["button", "input", "select", "textarea", "option", "optgroup", "fieldset"].includes(
    element.type,
  )
}

function renderProdRestrictedContent(children: React.ReactNode, tooltipContent: string) {
  const disabledChild = React.isValidElement(children)
    ? (() => {
        const element = children as React.ReactElement<{
          className?: string
          disabled?: boolean
          "aria-disabled"?: boolean
        }>

        return React.cloneElement(element, {
          ...(supportsDisabledProp(element) ? { disabled: true } : {}),
          "aria-disabled": true,
          className: cn(getElementClassName(element), DISABLED_STYLE),
        })
      })()
    : children

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("inline-block", DISABLED_STYLE)}>{disabledChild}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * 权限门控组件：
 * - hide: 无权限时隐藏（可选 fallback）
 * - disable: 无权限时禁用并展示 tooltip（优先复用 AuthButton）
 */
export function PermissionGuard({
  permission,
  mode = "OR",
  whenUnauthorized = "disable",
  tooltipContent = DEFAULT_NO_PERMISSION_TEXT,
  fallback = null,
  prodRestriction,
  children,
}: PermissionGuardProps) {
  const normalizedPermission = React.useMemo(() => {
    return normalizePermissionInput(permission)
  }, [permission])

  const permissionResult = usePermission(
    normalizedPermission,
    prodRestriction ? { mode, prodRestriction } : { mode },
  )

  if (whenUnauthorized === "hide") {
    if (permissionResult.isRestrictedInProd) {
      return <>{fallback}</>
    }

    return (
      <PermissionGate permission={normalizedPermission} mode={mode} fallback={fallback}>
        {children}
      </PermissionGate>
    )
  }

  if (permissionResult.isRestrictedInProd) {
    return renderProdRestrictedContent(
      children,
      permissionResult.reason ?? DEFAULT_PROD_RESTRICTION_TEXT,
    )
  }

  if (React.isValidElement(children)) {
    return (
      <AuthButton
        permission={normalizedPermission}
        mode={mode}
        showTooltip={true}
        tooltipContent={tooltipContent}
        asChild
      >
        {children}
      </AuthButton>
    )
  }

  return (
    <AuthButton
      permission={normalizedPermission}
      mode={mode}
      showTooltip={true}
      tooltipContent={tooltipContent}
    >
      {children}
    </AuthButton>
  )
}
