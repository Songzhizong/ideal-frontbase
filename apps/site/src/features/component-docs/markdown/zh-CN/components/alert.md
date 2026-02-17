用于在页面中突出显示关键状态信息，支持默认与危险语义样式。

源码位置：`packages/ui/alert.tsx`

## 何时使用

`Alert` 适合在当前上下文直接提示状态，不打断主流程。

- 表单提交结果提示
- 风险提醒和系统告警
- 关键状态变更通知

不建议使用场景：

- 需要强制用户确认的阻断操作（建议使用 `AlertDialog`）

## 代码演示

### 基础提示

```playground
basic
```

### 危险提示

```playground
destructive
```

### 搭配动作按钮

```playground
with-actions
```

## 属性说明 (API)

### Alert

<DataTable preset="props" :data="[
  { name: 'variant', type: 'default | destructive', default: 'default', description: '语义样式。' },
  { name: 'role', type: 'string', default: 'alert', description: '可访问语义角色。' },
  { name: 'className', type: 'string', default: '-', description: '容器样式扩展。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '提示内容。' }
]"/>

### AlertTitle / AlertDescription

<DataTable preset="props" :data="[
  { name: 'children', type: 'ReactNode', default: '-', description: '标题或描述内容。' },
  { name: 'className', type: 'string', default: '-', description: '样式扩展。' },
  { name: '用途', type: '-', default: '-', description: '分别用于主标题和补充说明。' }
]"/>

## FAQ

### `Alert` 与 `Toast` 怎么选？

`Alert` 适合页面内常驻提示，`Toast` 适合短时浮动反馈。

### 是否必须带图标？

不是必须，但关键状态建议带图标提升识别效率。
