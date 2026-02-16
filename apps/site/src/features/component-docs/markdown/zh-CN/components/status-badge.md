用于展示状态标签，内置语义色调（success/warning/error/info/neutral）和多种视觉变体。

源码位置：`packages/ui/status-badge.tsx`

## 何时使用

`StatusBadge` 适合在列表、详情、卡片中表达离散状态。

- 服务健康状态
- 审批/发布流程状态
- 工单、任务处理状态

不建议使用场景：

- 需要连续数值表达（建议用进度条或图表）

## 代码演示

### tone 语义色

```playground
tones
```

### variant 视觉变体

```playground
variants
```

### 业务状态映射

```playground
business-map
```

## 属性说明 (API)

### StatusBadge

<DataTable preset="props" :data="[
  { name: 'tone', type: 'success | warning | error | info | neutral', default: '-', description: '语义色调，必填。' },
  { name: 'variant', type: 'subtle | solid | ghost', default: 'subtle', description: '视觉变体。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '标签内容。' },
  { name: 'className', type: 'string', default: '-', description: '样式扩展。' },
  { name: '...props', type: 'Omit<BadgeProps, "variant">', default: '-', description: '透传 Badge 属性。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'StatusBadgeTone', value: 'success | warning | error | info | neutral' },
  { name: 'StatusBadgeVariant', value: 'subtle | solid | ghost' }
]"/>

## A11y

- 状态文本应可读，不要仅依赖颜色区分。
- 对关键状态建议配合额外说明（例如 tooltip 或描述列）。
- 列表中多个状态标签建议保持命名一致，避免同义词混用。

## 常见问题 (FAQ)

### `StatusBadge` 和 `Badge` 的区别是什么？

`StatusBadge` 针对状态语义预置了 tone/variant 映射；`Badge` 更通用。

### 如何定义业务状态到 tone 的映射？

建议在业务层维护一张映射表，再统一传给 `StatusBadge`，保证全站一致。
