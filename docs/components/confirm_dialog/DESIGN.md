# 全局命令式确认框 (Global Imperative Confirm Dialog) 设计文档

## 1. 需求背景与痛点
在企业后台管理系统中，“删除”、“重置密码”、“提交审核”等操作高频出现，且都需要二次确认。
*   **原生痛点**：使用浏览器原生的 `window.confirm` 样式丑陋，不可定制，且阻塞主线程。
*   **UI 库痛点**：直接使用 shadcn 的 `<AlertDialog>` 是声明式的，意味着每个需要确认的页面都要引入组件、定义 `isOpen` 状态、定义 `handleCancel` 和 `handleConfirm` 函数，导致业务代码中充满样板代码（Boilerplate）。

## 2. 设计目标
1.  **调用简洁**：支持通过函数/Hook 方式直接调用，无需维护局部 `open` 状态。
2.  **Promise 驱动**：使用 `await` 等待用户操作结果，逻辑流线性化，避免回调地狱。
3.  **高度可配**：支持自定义标题、内容、按钮文字、按钮变体（如红色删除按钮）。
4.  **样式统一**：完全复用 shadcn/ui 的 `AlertDialog` 组件，保持设计系统一致性。
5.  **React 19 适配**：支持在并发渲染与 `Transition` 场景下稳定工作（确认框由客户端交互触发）。

## 3. API 接口设计

我们需要封装一个 Hook `useConfirm` 或全局函数，推荐接口定义如下：

### 3.1 核心方法
```typescript
const { confirm } = useConfirm();

// 调用签名
confirm(options: ConfirmOptions): Promise<boolean>
```

### 3.2 参数定义 (ConfirmOptions)
```typescript
interface ConfirmOptions {
  title?: React.ReactNode; // 标题，默认为 "提示"
  description?: React.ReactNode | null; // 详细描述，默认为 "您确定要执行此操作吗？"；传 null 表示不显示
  confirmText?: string; // 确认按钮文字，默认为 "确认"
  cancelText?: string; // 取消按钮文字，默认为 "取消"
  variant?: "default" | "destructive"; // 确认按钮样式，用于区分普通操作和危险操作
  icon?: React.ReactNode; // 可选的图标
}
```

### 3.3 行为约定 (Contract)
为保证业务方「按 Promise 线性写流程」时行为稳定，确认框需要遵循如下约定：
1.  **单例互斥**：同一时刻只允许存在 1 个未决确认（pending confirm）。
2.  **再次调用的处理**：若 `confirm()` 在上一笔未决确认尚未结算时被再次调用：
  *   先以 `false` 结算上一笔；
  *   再展示新的确认框并返回新的 Promise。
3.  **关闭即取消**：以下行为均等价于取消，并以 `false` 结算：
  *   点击“取消”
  *   按 `Esc`
  *   点击遮罩（overlay）导致关闭
4.  **只结算一次**：同一次确认只允许 resolve 一次。即使 UI 组件层出现重复触发（例如点击按钮后又触发 `onOpenChange(false)`），也不得重复结算同一个 Promise。
5.  **运行边界**：`confirm()` 只能在确认框 UI 已挂载的客户端环境中调用；否则会导致 Promise 无法被用户交互结算。工程集成时需保证全局组件在应用生命周期内只挂载一次且不随路由切换卸载。
6.  **未挂载兜底**：若调用发生在确认框 UI 尚未挂载的时机（例如极早期初始化或异常卸载），`confirm()` 推荐直接以 `false` 结算，避免 Promise 悬挂。

### 3.4 使用示例

**场景 A：基本删除确认**
```tsx
const handleDelete = async (id: string) => {
  const isConfirmed = await confirm({
    title: "确认删除该用户？",
    description: "此操作不可恢复，请谨慎操作。",
    variant: "destructive",
    confirmText: "删除",
  });

  if (isConfirmed) {
    // 执行删除逻辑
    await deleteUser(id);
    toast.success("删除成功");
  }
};
```

---

## 4. 架构与实现原理

为了解耦 UI 与逻辑，并避免 React Context 的层级嵌套导致的使用限制（有时需要在 Context 之外使用），建议结合 **Zustand** 进行状态管理。

补充说明：
*   **运行边界**：确认框本质是客户端 UI 交互，`confirm()` 必须在已挂载 UI 的客户端环境中调用。若需要配合“提交/删除”等服务端能力，应采用“先在客户端 `confirm`，再触发请求/Server Action”的组合方式。
*   **单例互斥**：本设计默认同一时刻只允许存在一个“未决确认”（pending confirm）。当再次调用 `confirm()` 时，将自动以 `false` 结算上一笔确认并展示新的确认框，避免 Promise 悬挂。

### 4.1 架构图
```mermaid
[业务组件] -> 调用 confirm() -> [Zustand Store (State)]
                                     |
                                     v
[GlobalConfirmDialog 组件] <--- 监听 State 变化
        |
        +-> 渲染 shadcn <AlertDialog>
```

### 4.2 核心逻辑流程
1.  **Trigger**: 用户调用 `confirm(options)`。
2.  **Store Update**:
  *   创建一个新的 `Promise`。
  *   将 Promise 的 `resolve` 方法存储在 Store 中。
  *   将 `options` 存储在 Store 中。
  *   设置 `isOpen: true`。
  *   若存在上一笔未决确认（已存储 `resolver`），则先以 `false` 结算，保证不会出现 Promise 悬挂。
3.  **Render**: `<GlobalConfirmDialog />` 监听到 `isOpen` 变真，渲染弹窗。
4.  **Action**:
  *   用户点击“确认” -> 调用 Store 中的 `resolve(true)` -> 关闭弹窗。
  *   用户点击“取消” -> 调用 Store 中的 `resolve(false)` -> 关闭弹窗。
  *   用户按 `Esc` 或点击遮罩导致弹窗关闭 -> 等同“取消”，调用 Store 中的 `resolve(false)`。

---

## 5. 详细代码实现 (Draft)

### 5.1 Store 定义 (packages/confirm/confirm-store.ts)
利用 Zustand 存储弹窗状态和 Promise 的 resolver。

```typescript
import type { ReactNode } from "react"
import { create } from "zustand"

interface ConfirmOptions {
	title?: ReactNode
	description?: ReactNode | null
	confirmText?: string
	cancelText?: string
	variant?: "default" | "destructive"
	icon?: ReactNode
}

interface ConfirmStore {
	isOpen: boolean
	options: ConfirmOptions
	resolver: ((value: boolean) => void) | null

	confirm: (options: ConfirmOptions) => Promise<boolean>

	handleConfirm: () => void
	handleCancel: () => void
}

const defaultOptions: ConfirmOptions = {
	title: "提示",
	description: "您确定要执行此操作吗？",
	confirmText: "确认",
	cancelText: "取消",
	variant: "default",
}

export const useConfirmStore = create<ConfirmStore>((set, get) => ({
	isOpen: false,
	options: defaultOptions,
	resolver: null,

	confirm: (options) =>
		new Promise((resolve) => {
			const { resolver } = get()
			if (resolver) resolver(false)

			set({
				isOpen: true,
				options: { ...defaultOptions, ...options },
				resolver: resolve,
			})
		}),

	handleConfirm: () => {
		const { resolver } = get()
		if (!resolver) return

		resolver(true)
		set({ isOpen: false, resolver: null, options: defaultOptions })
	},

	handleCancel: () => {
		const { resolver } = get()
		if (!resolver) return

		resolver(false)
		set({ isOpen: false, resolver: null, options: defaultOptions })
	},
}))

export const confirm = (options: ConfirmOptions) => useConfirmStore.getState().confirm(options)
```

### 5.2 全局组件封装 (packages/confirm/global-confirm-dialog.tsx)
这个组件需要放置在应用根节点附近，确保不会被路由切换卸载。

```tsx
import { useConfirmStore } from "@/packages/confirm"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/packages/ui/alert-dialog"

export function GlobalConfirmDialog() {
  const { isOpen, options, handleConfirm, handleCancel } = useConfirmStore()

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleCancel()
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <span className="inline-flex items-center gap-2">
              {options.icon ? <span className="shrink-0">{options.icon}</span> : null}
              <span>{options.title}</span>
            </span>
          </AlertDialogTitle>
          {options.description ? (
            <AlertDialogDescription>{options.description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>{options.cancelText}</AlertDialogCancel>
          <AlertDialogAction
            variant={options.variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
          >
            {options.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

### 5.3 导出 Hook (packages/confirm/use-confirm.ts)
为了让业务代码调用更符合语义，封装一个简单的 Hook。

```typescript
import { useConfirmStore } from "@/packages/confirm"

export function useConfirm() {
  const confirm = useConfirmStore((state) => state.confirm)
  return { confirm }
}
```

---

## 6. 集成指南

### 6.1 注册组件
在应用“根组件/全局 Provider”处引入组件，确保整个应用生命周期内只挂载一次，并且不会被路由切换卸载。

本项目推荐直接挂载在 `apps/<app-name>/src/app/provider.tsx` 的 `ThemeProvider` 内部（保证主题令牌可用），并放在 `RouterProvider` 之后：

```tsx
import { GlobalConfirmDialog } from "@/packages/confirm"

export function AppProvider() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <NuqsAdapter>
          <RouterProvider router={router} />
        </NuqsAdapter>
        <GlobalConfirmDialog />
        <Toaster position="top-center" richColors />
        {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
      </ThemeProvider>
    </QueryClientProvider>
  )
}
```

### 6.2 调用方式建议
1.  **组件内调用（推荐）**：通过 `useConfirm()` 获取 `confirm`，在事件处理函数中 `await`。
2.  **非组件环境调用**：通过 `packages/confirm/confirm-store.ts` 导出的 `confirm(options)` 调用（基于 `useConfirmStore.getState()`）。

### 6.3 扩展功能建议 (Advanced)

1.  **异步 Loading 支持**：
  *   目前的实现点击确认后立即关闭弹窗。
  *   **进阶设计**：`confirm` 接受一个 `onConfirm` async 函数。如果传入了该函数，点击确认后，Dialog 不关闭，按钮进入 `loading` 状态，直到 Promise resolve。
  *   *适配 React 19*：可以使用 `useTransition` 来承载 pending 状态；注意确认框依然由客户端触发，建议采用“先 confirm -> 再 startTransition/触发请求”的调用顺序。

2.  **键盘事件处理**：
  *   确保 `Enter` 键触发确认，`Esc` 键触发取消（shadcn 默认支持 Esc，但需确保焦点管理正确）。

3.  **多实例互斥**：
  *   本设计为单例模式（Singleton）。同一时间只维护一个确认框；再次调用会自动取消上一笔未决确认并打开新的确认框。
  *   若业务确实需要“弹窗叠弹窗”，可将 Store 改造为队列或栈（Stack）结构，并明确遮罩/焦点的交互规则。

## 7. 总结
该设计方案完美契合 React 19 + shadcn/ui 技术栈：
*   **状态管理**：利用 Zustand 避免 Context 重渲染性能问题。
*   **UI 复用**：底层完全使用 shadcn 组件，主题、深色模式自动适配。
*   **开发体验**：一行代码唤起确认框，极大地简化了 CRUD 业务开发。
