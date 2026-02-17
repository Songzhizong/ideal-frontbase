用于承载“结果态”反馈，适合在操作完成页、错误页、空流程页中集中表达状态与后续动作。

源码位置：`packages/ui/result.tsx`

## 何时使用

`Result` 适合在关键节点输出明确结果和下一步指引。

- 提交成功、处理失败、风险提醒等业务结果页
- `403/404/500` 等页面级异常提示
- 需要在结果区域同时提供下一步操作按钮

不建议使用场景：

- 仅需短暂提示且不占页面布局（建议用 `Sonner`）

## 代码演示

### 业务状态变体

```playground
status-variants
```

### HTTP 错误状态

```playground
http-errors
```

### 带操作区结果页

```playground
with-actions
```

### 自定义图标

```playground
custom-icon
```

## 属性说明 (API)

### Result

<DataTable preset="props" :data="[
  { name: 'status', type: 'ResultStatus', default: 'info', description: '结果状态，决定默认图标、标题、副标题与语义色。' },
  { name: 'title', type: 'ReactNode', default: '由 status 决定', description: '主标题；传入后覆盖内置标题。' },
  { name: 'subtitle', type: 'ReactNode', default: '由 status 决定', description: '补充说明；传入后覆盖内置副标题。' },
  { name: 'icon', type: 'ReactNode', default: '由 status 决定', description: '自定义图标。' },
  { name: 'extra', type: 'ReactNode', default: '-', description: '扩展操作区，通常放按钮组。' },
  { name: 'className', type: 'string', default: '-', description: '根节点样式扩展。' },
  { name: '...props', type: 'React.ComponentProps<"section">', default: '-', description: '透传原生 section 属性（`title` 已被组件字段占用）。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'ResultStatus', value: 'success | error | warning | info | 403 | 404 | 500' },
  { name: 'ResultProps', value: 'Omit<React.ComponentProps<"section">, "title"> & { status/title/subtitle/icon/extra }' }
]"/>

## 状态指南

- `success`: 操作完成，可引导“继续下一步”。
- `warning`: 可继续但存在风险，建议补充确认动作。
- `error`: 操作失败，建议提供“重试/联系支持”。
- `403/404/500`: 页面级异常，建议结合导航动作帮助用户离开死路。

## A11y

- 组件会根据状态自动设置语义角色：`success/info` 为 `status`，其余为 `alert`。
- 建议确保 `title` 与 `subtitle` 文案完整，避免只给图标。
- `extra` 中的按钮需要明确动作文本，不建议只放图标按钮。

## 常见问题 (FAQ)

### 如何覆盖内置标题文案？

直接传入 `title` / `subtitle` 即可覆盖默认文案。

```tsx
<Result status="success" title="审批已通过" subtitle="你可以继续发起发布。" />
```

### 如何实现“结果页 + 操作按钮”布局？

把按钮放进 `extra`，组件会自动渲染操作区。

```tsx
<Result
  status="error"
  extra={<Button>重试</Button>}
/>
```
