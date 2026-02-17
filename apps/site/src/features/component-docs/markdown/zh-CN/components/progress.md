用于展示任务完成度，适合上传、发布、引导步骤等线性进度场景。

源码位置：`packages/ui/progress.tsx`

## 何时使用

`Progress` 适合“可量化、会推进”的过程反馈。

- 文件上传、数据同步、部署发布进度
- 多步骤向导中的阶段完成度展示
- 列表任务的并行处理可视化

不建议使用场景：

- 无法估算进度的长任务（建议使用 `Spinner` 或骨架屏）

## 代码演示

### 基础进度

```playground
basic
```

### 多任务进度列表

```playground
multiple-tasks
```

### 上传流程进度

```playground
upload-flow
```

### 表单步骤进度

```playground
form-step
```

## 属性说明 (API)

### Progress

<DataTable preset="props" :data="[
  { name: 'value', type: 'number | null', default: '-', description: '当前进度值。推荐传入 `0-100`。' },
  { name: 'max', type: 'number', default: '100', description: '进度最大值（来自 Radix Progress Root）。' },
  { name: 'getValueLabel', type: '(value, max) => string', default: '-', description: '自定义读屏文本。' },
  { name: 'className', type: 'string', default: '-', description: '进度条根节点自定义样式。' },
  { name: 'aria-label', type: 'string', default: '-', description: '无可见标题时建议提供可访问名称。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'ProgressProps', value: 'React.ComponentProps<typeof ProgressPrimitive.Root>' },
  { name: 'value', value: 'number | null | undefined' },
  { name: 'getValueLabel', value: '(value: number, max: number) => string' }
]"/>

## A11y

- 建议搭配可见文本（如“68%”）与 `aria-label` 同时提供语义。
- 如果页面中有多个进度条，确保每条进度都有独立标签。
- 对读屏场景可使用 `getValueLabel` 输出更可理解的描述文本。

## 常见问题 (FAQ)

### 传入 `max` 后，为什么视觉宽度没有按比例变化？

当前封装的视觉宽度直接按 `value` 计算位移，建议在业务层先换算为百分比后再传给 `value`。

```tsx
const percent = Math.round((current / max) * 100)
<Progress value={percent} max={max} />
```

### 如何表达已完成状态？

将 `value` 设为 `100`，并同步显示完成文案，避免用户误判。
