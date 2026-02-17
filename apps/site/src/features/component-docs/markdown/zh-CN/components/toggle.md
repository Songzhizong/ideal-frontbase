用于表达“开/关”二态选择，适合格式开关、筛选开关和轻量功能切换。

源码位置：`packages/ui/toggle.tsx`

## 何时使用

`Toggle` 适合单个二元状态的即时切换。

- 富文本工具栏（粗体、斜体、下划线）
- 列表筛选开关（仅看异常、仅看未读）
- 轻量功能开关（自动刷新、紧凑模式）

不建议使用场景：

- 需要明确“提交后生效”的配置开关（建议用 `Switch`）

## 代码演示

### 基础用法

```playground
basic
```

### 受控状态

```playground
controlled
```

### 变体与尺寸

```playground
variants-and-sizes
```

## 属性说明 (API)

### Toggle

<DataTable preset="props" :data="[
  { name: 'pressed', type: 'boolean', default: '-', description: '受控选中状态。' },
  { name: 'defaultPressed', type: 'boolean', default: 'false', description: '非受控初始状态。' },
  { name: 'onPressedChange', type: '(pressed: boolean) => void', default: '-', description: '状态变化回调。' },
  { name: 'variant', type: 'default | outline', default: 'default', description: '视觉变体。' },
  { name: 'size', type: 'sm | default | lg', default: 'default', description: '尺寸。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用交互。' },
  { name: 'asChild', type: 'boolean', default: 'false', description: '把行为注入自定义子元素。' },
  { name: 'className', type: 'string', default: '-', description: '样式扩展。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'ToggleProps', value: 'React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>' },
  { name: 'ToggleVariant', value: 'default | outline' },
  { name: 'ToggleSize', value: 'sm | default | lg' }
]"/>

## A11y

- 必须提供可访问名称（文本内容或 `aria-label`）。
- 对仅图标按钮务必加 `aria-label`，避免读屏无语义。
- 多个 Toggle 并列时，建议用分组容器标注整体含义。

## 常见问题 (FAQ)

### Toggle 和 Switch 有什么区别？

`Toggle` 更偏“工具按钮”语义，常见于即时样式/筛选切换；`Switch` 更偏“设置项开关”。

### 如何在外部状态管理中使用？

使用受控模式：传入 `pressed` 与 `onPressedChange`。
