import { useRouterState } from "@tanstack/react-router"
import * as React from "react"
import {
  getWorkspaceTenants,
  resolveWorkspaceSelection,
  type WorkspaceProjectEnvironment,
} from "@/components/workspace/workspace-context"
import type { Permission, UserProfile } from "@/packages/auth-core"
import { useAuthStore } from "@/packages/auth-core"

export type PermissionSubjectType = "user" | "service_account"
export type PermissionEnvironmentTag = WorkspaceProjectEnvironment | null

export interface PermissionContextValue {
  hasPermission: (permission: Permission | readonly Permission[], mode?: "AND" | "OR") => boolean
  permissions: readonly Permission[]
  subjectType: PermissionSubjectType
  environmentTag: PermissionEnvironmentTag
  isProdEnvironment: boolean
}

interface PermissionContextProviderProps {
  children: React.ReactNode
  subjectType?: PermissionSubjectType
}

const PermissionContext = React.createContext<PermissionContextValue | null>(null)

function normalizePermissionInput(
  permission: Permission | readonly Permission[],
): Permission | Permission[] {
  if (typeof permission === "string") {
    return permission
  }

  return [...permission]
}

function resolveSubjectType(
  user: UserProfile | null,
  subjectType?: PermissionSubjectType,
): PermissionSubjectType {
  if (subjectType) {
    return subjectType
  }

  return user?.containerId ? "service_account" : "user"
}

export function PermissionContextProvider({
  children,
  subjectType,
}: PermissionContextProviderProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const user = useAuthStore((state) => state.user)
  const tenantId = useAuthStore((state) => state.tenantId)
  const permissions = useAuthStore((state) => state.permissions)
  const hasPermission = useAuthStore((state) => state.hasPermission)

  const tenants = React.useMemo(() => {
    return getWorkspaceTenants(user)
  }, [user])

  const workspace = React.useMemo(() => {
    return resolveWorkspaceSelection(pathname, tenants, tenantId)
  }, [pathname, tenantId, tenants])

  const environmentTag: PermissionEnvironmentTag =
    workspace.scope === "project" ? (workspace.project?.environment ?? null) : null

  const value = React.useMemo<PermissionContextValue>(() => {
    return {
      hasPermission: (permission, mode = "OR") => {
        return hasPermission(normalizePermissionInput(permission), mode)
      },
      permissions,
      subjectType: resolveSubjectType(user, subjectType),
      environmentTag,
      isProdEnvironment: environmentTag === "Prod",
    }
  }, [environmentTag, hasPermission, permissions, subjectType, user])

  return <PermissionContext value={value}>{children}</PermissionContext>
}

export function usePermissionContext() {
  const context = React.useContext(PermissionContext)

  if (!context) {
    throw new Error("usePermissionContext must be used within PermissionContextProvider.")
  }

  return context
}
