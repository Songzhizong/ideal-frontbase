用于将输入控件与前后附加内容组合为一个整体，适合搜索框、金额输入和复合编辑器。

源码位置：`packages/ui/input-group.tsx`

## 何时使用

`InputGroup` 适用于输入框需要前后文信息或额外操作的场景。

- 搜索框前缀图标 + 触发按钮
- 金额输入（币种、单位）
- 文本域 + 底部动作条

不建议使用场景：

- 仅普通输入框且无附加内容（直接使用 `Input` / `Textarea`）

## 代码演示

### 搜索输入组

```playground
basic-search
```

### 金额编辑器

```playground
price-editor
```

### 文本域与底部操作

```playground
textarea-actions
```

### 错误状态

```playground
invalid-state
```

## 属性说明 (API)

### InputGroup

<DataTable preset="props" :data="[
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用整组输入。' },
  { name: 'className', type: 'string', default: '-', description: '容器样式扩展。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '组合子组件。' }
]"/>

### InputGroupAddon

<DataTable preset="props" :data="[
  { name: 'align', type: 'inline-start | inline-end | block-start | block-end', default: 'inline-start', description: '附加内容位置。' },
  { name: 'className', type: 'string', default: '-', description: '附加区样式扩展。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '图标、文本或按钮。' }
]"/>

### InputGroupButton

<DataTable preset="props" :data="[
  { name: 'size', type: 'xs | sm | icon-xs | icon-sm', default: 'xs', description: '按钮尺寸。' },
  { name: 'variant', type: 'ButtonVariant', default: 'ghost', description: '按钮变体。' },
  { name: 'type', type: 'button | submit | reset', default: 'button', description: '按钮类型。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '按钮内容。' }
]"/>

### InputGroupInput / InputGroupTextarea / InputGroupText

<DataTable preset="props" :data="[
  { name: 'className', type: 'string', default: '-', description: '输入控件或文本样式扩展。' },
  { name: 'value', type: 'string', default: '-', description: '受控值（输入类组件）。' },
  { name: 'onChange', type: 'event callback', default: '-', description: '输入变化回调（输入类组件）。' }
]"/>

## FAQ

### `InputGroup` 里的输入框为什么不用外边框？

组件内部已经处理了组合容器边框，子输入控件默认去边框以避免双边框。

### 如何做上下结构（如输入框 + 底部工具栏）？

将 `InputGroupAddon` 的 `align` 设为 `block-end` 或 `block-start`。
