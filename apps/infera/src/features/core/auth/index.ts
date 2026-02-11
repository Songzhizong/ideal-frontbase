/**
 * Auth Feature - Barrel Export (Public API)
 *
 * 这是 Auth 模块的公共入口，类似于一个 NPM 包的 index.ts
 * 其他模块应该从这里导入，而不是直接访问内部文件
 */

// ============================================
// Hooks (Public API)
// ============================================
export { useLogoutHandler } from "@/hooks/use-logout-handler"
// ============================================
// Types & Schemas (Public API)
// ============================================
export type { Permission, UserProfile as User } from "@/packages/auth-core"
// ============================================
// Stores (Public API)
// ============================================
export { authStore, PermissionSchema, useAuthStore } from "@/packages/auth-core"
// ============================================
// Components (Public API)
// ============================================
export { LoginPage } from "./components/login-page"
export { NoAccess } from "./components/no-access"
export { PermissionGuard } from "./components/permission-guard"
export { UserMenu } from "./components/user-menu"
export { useLoginHandler } from "./hooks/use-login-handler"
export type {
  PermissionContextValue,
  PermissionEnvironmentTag,
  PermissionSubjectType,
} from "./permission-context"
export { PermissionContextProvider, usePermissionContext } from "./permission-context"
export { enforceRoutePermission } from "./route-permission"
export type { AuthResponse } from "./types"
export type {
  ProdRestrictionOptions,
  UsePermissionOptions,
  UsePermissionResult,
} from "./use-permission"
export { usePermission } from "./use-permission"

// ============================================
// Utils (Public API)
// ============================================
export { showUnauthorizedDialog } from "./utils/show-unauthorized-dialog"
export { createDebouncedUnauthorizedHandler } from "./utils/unauthorized-handler"
