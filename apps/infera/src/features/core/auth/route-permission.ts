import { redirect } from "@tanstack/react-router"
import type { Permission } from "@/packages/auth-core"
import { authStore } from "@/packages/auth-core"

interface RoutePermissionOptions {
  permission: Permission | readonly Permission[]
  mode?: "AND" | "OR"
}

function normalizePermissionInput(
  permission: Permission | readonly Permission[],
): Permission | Permission[] {
  if (typeof permission === "string") {
    return permission
  }

  return [...permission]
}

export function enforceRoutePermission({ permission, mode = "OR" }: RoutePermissionOptions) {
  const { hasPermission } = authStore.getState()

  if (hasPermission(normalizePermissionInput(permission), mode)) {
    return
  }

  throw redirect({
    to: "/errors/403",
  })
}
