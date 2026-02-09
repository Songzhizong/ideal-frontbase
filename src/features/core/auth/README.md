# Auth Feature - 使用文档

## 📦 功能概览

完整的认证系统，包含：
- ✅ Token 管理（自动注入到 HTTP 请求头）
- ✅ 用户信息管理
- ✅ 权限系统（支持单个/多个权限检查）
- ✅ 登录/登出流程
- ✅ 权限守卫组件
- ✅ 持久化存储（LocalStorage + Zustand）

---

## 🚀 快速开始

### 1. 登录流程

```tsx
import { useAuth } from "@/features/core/auth"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

function LoginPage() {
  const { login, isLoggingIn } = useAuth()
  const navigate = useNavigate()

  const handleLogin = (email: string, password: string) => {
    login(
      { email, password },
      {
        onSuccess: (data) => {
          // useAuth 内部已自动调用 authStore.login()
          toast.success("Login successful!")
          navigate({ to: "/dashboard" })
        },
        onError: (error) => {
          toast.error("Login failed")
        },
      }
    )
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      handleLogin(
        formData.get("email") as string,
        formData.get("password") as string
      )
    }}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit" disabled={isLoggingIn}>
        {isLoggingIn ? "Logging in..." : "Login"}
      </button>
    </form>
  )
}
```

### 2. 登出流程

```tsx
import { useAuth } from "@/features/core/auth"
import { useNavigate } from "@tanstack/react-router"

function Header() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        navigate({ to: "/login" })
      },
    })
  }

  return (
    <header>
      <span>Welcome, {user?.name}</span>
      <button onClick={handleLogout}>Logout</button>
    </header>
  )
}
```

### 3. 权限检查（组件内）

```tsx
import { useAuth } from "@/features/core/auth"

function UserManagementPage() {
  const { hasPermission, hasAnyPermission } = useAuth()

  return (
    <div>
      <h1>User Management</h1>

      {/* 单个权限检查 */}
      {hasPermission("user:delete") && (
        <button>Delete User</button>
      )}

      {/* 多个权限检查（任意一个） */}
      {hasAnyPermission(["user:edit", "user:delete"]) && (
        <button>Manage User</button>
      )}
    </div>
  )
}
```

### 4. 权限守卫组件

```tsx
import { PermissionGuard } from "@/features/core/auth"

function AdminPanel() {
  return (
    <div>
      {/* 单个权限 */}
      <PermissionGuard permission="admin:read">
        <AdminDashboard />
      </PermissionGuard>

      {/* 多个权限（任意一个） */}
      <PermissionGuard 
        permission={["user:edit", "user:delete"]} 
        mode="any"
      >
        <UserActions />
      </PermissionGuard>

      {/* 多个权限（全部需要） + Fallback */}
      <PermissionGuard 
        permission={["admin:read", "admin:write"]} 
        mode="all"
        fallback={<p>You don't have permission to access this.</p>}
      >
        <SensitiveData />
      </PermissionGuard>
    </div>
  )
}
```

---

## 🔐 路由守卫（TanStack Router）

在 `src/routes/_authenticated.tsx` 中使用 `beforeLoad` 进行路由级别的权限控制：

```tsx
import { createFileRoute, redirect } from "@tanstack/react-router"
import { useAuthStore } from "@/hooks/use-auth-store"

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location }) => {
    const { isAuthenticated } = useAuthStore.getState()

    if (!isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href, // 登录后跳回原页面
        },
      })
    }
  },
})
```

### 权限级别的路由守卫

```tsx
import { createFileRoute, redirect } from "@tanstack/react-router"
import { authStore } from "@/packages/auth-core"

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: () => {
    // 在非 React 环境中使用 .getState()
    const { hasPermission } = authStore.getState()

    if (!hasPermission("admin:access")) {
      throw redirect({
        to: "/403", // 无权限页面
      })
    }
  },
})
```

---

## 📚 API 说明

### `useAuth()` Hook

统一的认证 Hook，整合所有功能：

```typescript
const {
  // State
  user,              // 当前用户信息
  token,             // JWT Token
  permissions,       // 权限列表
  isAuthenticated,   // 是否已登录

  // Loading States
  isLoadingUser,     // 是否正在加载用户信息
  isLoggingIn,       // 是否正在登录
  isLoggingOut,      // 是否正在登出

  // Permission Checks
  hasPermission,     // 检查单个权限
  hasAnyPermission,  // 检查任意权限（OR）
  hasAllPermissions, // 检查所有权限（AND）

  // Actions
  login,             // 登录方法
  logout,            // 登出方法
  refetchUser,       // 重新获取用户信息
} = useAuth()
```

### `useAuthStore()` Hook

底层 Zustand Store，用于直接操作状态（高级用法）：

```typescript
import { useAuthStore } from "@/packages/auth-core"

const authStore = useAuthStore()

// 手动设置 Token（如从 URL 参数获取）
authStore.setToken("your-token")

// 手动设置用户信息
authStore.setUser({ id: "1", name: "John", email: "john@example.com", role: "admin" })

// 手动设置权限
authStore.setPermissions(["user:read", "user:write"])

// 完整登录流程（一次性设置所有信息）
authStore.login(token, user, permissions)

// 登出
authStore.logout()
```

### 在非 React 环境中使用

```typescript
import { authStore } from "@/packages/auth-core"

// 在 api-client.ts 或其他非 React 文件中
const token = authStore.getState().token
const isAuthenticated = authStore.getState().isAuthenticated

// 调用方法
authStore.getState().logout()
```

---

## 🎯 权限命名规范

推荐使用 `resource:action` 格式：

```typescript
// 资源级别权限
"user:read"       // 查看用户
"user:write"      // 编辑用户
"user:delete"     // 删除用户
"user:create"     // 创建用户

// 功能级别权限
"admin:access"    // 访问管理后台
"report:export"   // 导出报表
"settings:manage" // 管理系统设置

// 特殊权限
"*"               // 超级管理员（拥有所有权限）
```

---

## 🔄 数据流

```
1. 用户登录
   ↓
2. 调用 login() → POST /auth/login
   ↓
3. 后端返回 { token, user, permissions }
   ↓
4. authStore.login() 保存到 Zustand + LocalStorage
   ↓
5. api-client 自动在请求头注入 Authorization: Bearer {token}
   ↓
6. useCurrentUser() 自动获取最新用户信息（可选）
   ↓
7. 用户访问受保护页面 → beforeLoad 检查 isAuthenticated
   ↓
8. 组件内使用 hasPermission() 或 <PermissionGuard> 控制 UI
```

---

## 🛠️ 后端接口约定

### POST /auth/login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://example.com/avatar.jpg",
    "role": "admin"
  },
  "permissions": ["user:read", "user:write", "admin:access"]
}
```

### GET /auth/me

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "user": {
    "id": "1",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://example.com/avatar.jpg",
    "role": "admin"
  },
  "permissions": ["user:read", "user:write", "admin:access"]
}
```

### POST /auth/logout

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{}
```

---

## 🧪 测试建议

```typescript
import { renderHook, act } from "@testing-library/react"
import { useAuthStore } from "@/hooks/use-auth-store"

describe("useAuthStore", () => {
  beforeEach(() => {
    // 清空 Store
    useAuthStore.getState().logout()
  })

  it("should login successfully", () => {
    const { result } = renderHook(() => useAuthStore())

    act(() => {
      result.current.login(
        "token123",
        { id: "1", name: "John", email: "john@example.com", role: "admin" },
        ["user:read"]
      )
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.name).toBe("John")
    expect(result.current.hasPermission("user:read")).toBe(true)
  })
})
```

---

## 📝 注意事项

1. **Token 存储**: Token 同时存储在 Zustand 和 LocalStorage，刷新页面后自动恢复登录状态。
2. **自动注入**: `api-client.ts` 的 `beforeRequest` Hook 会自动从 LocalStorage 读取 Token 并注入到请求头。
3. **401 处理**: 当后端返回 401 时，`api-client.ts` 会自动跳转到 `/login`。
4. **权限缓存**: 权限列表存储在 Zustand，避免频繁请求后端。
5. **类型安全**: 所有 API 响应都经过 Zod 运行时校验，确保类型正确。

---

## 🔗 相关文件

- `src/types/auth.ts` - 类型定义和 Zod Schema
- `src/hooks/use-auth-store.ts` - Zustand Store
- `src/features/auth/hooks/use-auth.ts` - 统一 Hook
- `src/features/auth/api/` - API 层
- `src/features/auth/components/` - 权限守卫组件
- `src/packages/api-core/api-client.ts` - HTTP 客户端（Token 自动注入）
