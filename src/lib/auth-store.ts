import { create } from "zustand"
import { persist } from "zustand/middleware"
import { env } from "@/lib/env"
import type { Permission, UserProfile } from "@/types/auth"

/**
 * 性能优化：缓存静态权限判断结果
 * 避免每次 hasPermission 调用都进行字符串比较
 */
const IS_STATIC_ADMIN = env.VITE_IS_STATIC_ADMIN === "true"

type AuthState = {
  // State
  token: string | null
  user: UserProfile | null
  permissions: Permission[]
  permissionSet: Set<Permission> // 性能优化：用于 O(1) 权限查找
  isAuthenticated: boolean
  tenantId: string | null

  // Actions - Auth Flow
  login: (data: { token: string; user: UserProfile; permissions: Permission[] }) => void
  setToken: (token: string) => void
  setUser: (user: UserProfile) => void
  setPermissions: (permissions: Permission[]) => void
  logout: () => void
  setTenantId: (tenantId: string | null) => void

  // Actions - Permission Management
  hasPermission: (permission: Permission | Permission[], mode?: "AND" | "OR") => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
}

/**
 * Auth Store - 认证状态管理
 *
 * 这是一个 Zustand Store，既可以作为 React Hook 使用，也可以通过 .getState() 在任何地方使用。
 * 属于全局共享基础设施，不依赖于任何 feature。
 *
 * @example
 * // 在 React 组件中使用（作为 Hook）
 * const { token, isAuthenticated } = useAuthStore()
 *
 * @example
 * // 在非 React 环境中使用（如 api-client.ts）
 * const token = authStore.getState().token
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      token: null,
      user: null,
      permissions: [],
      permissionSet: new Set<Permission>(),
      isAuthenticated: false,
      tenantId: null,

      /**
       * 登录成功后调用，一次性设置所有认证信息
       * persist 中间件会自动处理 localStorage 存储
       */
      login: ({ token, user, permissions }) => {
        set({
          token,
          user,
          permissions,
          permissionSet: new Set(permissions), // 同步更新 Set 以优化查找性能
          isAuthenticated: true,
          tenantId: user.tenantId,
        })
      },

      /**
       * 设置访问令牌
       */
      setToken: (token) => {
        set({ token, isAuthenticated: true })
      },

      /**
       * 设置用户信息
       */
      setUser: (user) => {
        set({ user, tenantId: user.tenantId })
      },

      /**
       * 设置权限列表
       */
      setPermissions: (permissions) => {
        set({
          permissions,
          permissionSet: new Set(permissions), // 同步更新 Set 以优化查找性能
        })
      },

      /**
       * 登出，清空所有认证信息
       * persist 中间件会自动清理 localStorage
       */
      logout: () => {
        set({
          token: null,
          user: null,
          permissions: [],
          permissionSet: new Set<Permission>(),
          isAuthenticated: false,
          tenantId: null,
        })
      },

      /**
       * 设置当前租户 ID
       * @param tenantId - 租户 ID
       */
      setTenantId: (tenantId) => {
        set({ tenantId })
      },

      /**
       * 检查用户是否拥有指定权限
       * 性能优化：使用 Set.has() 实现 O(1) 查找，替代 Array.includes() 的 O(n) 查找
       * @param permission - 权限标识符或列表
       * @param mode - 检查模式：'AND' (所有均需满足) 或 'OR' (满足其一即可)，默认为 'OR' (针对数组)
       */
      hasPermission: (permission, mode = "OR") => {
        // Static Admin Override - 用于开发环境或静态部署
        if (IS_STATIC_ADMIN) {
          return true
        }

        const { permissionSet } = get()
        const required = Array.isArray(permission) ? permission : [permission]

        if (mode === "AND") {
          // 所有权限都必须存在
          return required.every((p) => permissionSet.has(p))
        }

        // OR 模式：至少有一个权限存在
        return required.some((p) => permissionSet.has(p))
      },

      /**
       * 检查用户是否拥有任意一个权限（OR 逻辑）
       * @deprecated 建议优先使用 hasPermission(list, 'OR')
       * @param permissions - 权限列表
       */
      hasAnyPermission: (permissions) => {
        return get().hasPermission(permissions, "OR")
      },

      /**
       * 检查用户是否拥有所有权限（AND 逻辑）
       * @deprecated 建议优先使用 hasPermission(list, 'AND')
       * @param permissions - 权限列表
       */
      hasAllPermissions: (permissions) => {
        return get().hasPermission(permissions, "AND")
      },
    }),
    {
      name: "auth-storage", // LocalStorage key
      partialize: (state) => ({
        // 只持久化这些字段 (Set 无法序列化到 JSON)
        token: state.token,
        user: state.user,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
        tenantId: state.tenantId,
      }),
      // 关键优化：从 localStorage 恢复数据后重建 permissionSet
      onRehydrateStorage: () => (state) => {
        if (state?.permissions) {
          state.permissionSet = new Set(state.permissions)
        }
      },
    },
  ),
)

/**
 * authStore - 非 Hook 版本
 * 在非 React 环境中使用（如 api-client 配置）
 */
export const authStore = useAuthStore
