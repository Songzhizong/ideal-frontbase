用于全局轻量反馈通知，适合异步任务结果、操作确认与系统提示。

源码位置：`packages/ui/sonner.tsx`

## 何时使用

`Sonner` 适合短时、非阻塞的系统级反馈。

- 提交、发布、保存等动作完成后的即时反馈
- 异步流程（如请求、导入）中的加载/成功/失败状态
- 需要在当前页面保留操作上下文，不打断用户流程

不建议使用场景：

- 需要用户强制确认的重要决策（建议使用 `Dialog` / `AlertDialog`）

## 代码演示

### 基础类型通知

```playground
basic
```

### Promise 生命周期通知

```playground
promise
```

### 带操作按钮通知

```playground
action
```

### 位置与主题配置

```playground
position-and-theme
```

## 属性说明 (API)

### Toaster

<DataTable preset="props" :data="[
  { name: 'id', type: 'string', default: '-', description: '通知容器唯一标识；搭配 `toast(..., { toasterId })` 做分组投递。' },
  { name: 'theme', type: 'light | dark | system', default: '跟随站点主题', description: '主题模式；封装组件会默认读取 next-themes 当前主题。' },
  { name: 'position', type: 'top-left | top-right | top-center | bottom-left | bottom-right | bottom-center', default: 'bottom-right', description: '通知出现位置。' },
  { name: 'richColors', type: 'boolean', default: 'false', description: '启用更强语义色提示（成功/警告/错误）。' },
  { name: 'visibleToasts', type: 'number', default: '3', description: '同一时刻可见通知数量上限。' },
  { name: 'duration', type: 'number', default: 'sonner 默认值', description: '通知自动关闭时长（毫秒）。' },
  { name: 'closeButton', type: 'boolean', default: 'false', description: '是否展示关闭按钮。' },
  { name: 'toastOptions', type: 'ToastOptions', default: '-', description: '全局默认通知配置，如 className、duration 等。' }
]"/>

### toast 常用方法

<DataTable preset="props" :data="[
  { name: 'toast(message, options)', type: 'function', default: '-', description: '普通通知。' },
  { name: 'toast.success/info/warning/error(message, options)', type: 'function', default: '-', description: '语义化通知快捷方法。' },
  { name: 'toast.promise(promise, options)', type: 'function', default: '-', description: '自动处理异步任务的 loading/success/error 状态。' },
  { name: 'toast.dismiss(id?)', type: 'function', default: '-', description: '关闭指定通知或全部通知。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'ToasterProps', value: 'import type { ToasterProps } from sonner' },
  { name: 'Position', value: 'top-left | top-right | top-center | bottom-left | bottom-right | bottom-center' },
  { name: 'ToastOptions', value: 'sonner 内置通知配置类型（className/duration/richColors 等）' }
]"/>

## A11y

- 默认渲染 `aria-live` 通知容器，适合播报短消息。
- 建议为关键通知提供简短且可理解的文案，避免仅使用图标。
- 带动作按钮的通知应保证按钮文本语义明确（如“重试”“查看详情”）。

## 常见问题 (FAQ)

### 如何让不同业务区域的通知互不干扰？

为 `Toaster` 设置唯一 `id`，触发时传入 `toasterId`。

```tsx
<Toaster id="orders" />
toast.success("订单已创建", { toasterId: "orders" })
```

### 如何处理异步请求三态提示？

优先使用 `toast.promise`，避免手动维护多个通知。

```tsx
toast.promise(fetchData(), {
  loading: "加载中...",
  success: "加载成功",
  error: "加载失败",
})
```
