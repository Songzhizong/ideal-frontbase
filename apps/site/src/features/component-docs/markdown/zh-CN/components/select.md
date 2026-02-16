用于从候选项中选择单个值，支持分组、分隔和自定义触发器内容。

源码位置：`packages/ui/select.tsx`

## 何时使用

`Select` 适用于选项有限且需要较好可访问交互的单选场景。

- 语言或环境切换
- 过滤器条件选择
- 表单枚举值选择

不建议使用场景：

- 多选场景（建议改用 `Combobox` 或标签选择模式）

## 代码演示

### 基础选择器

```playground
basic
```

### 分组与分隔

```playground
grouped
```

### 受控模式与自定义尾部图标

```playground
controlled
```

## 属性说明 (API)

### Select

<DataTable preset="props" :data="[
  { name: 'value', type: 'string', default: '-', description: '受控值。' },
  { name: 'defaultValue', type: 'string', default: '-', description: '非受控初始值。' },
  { name: 'onValueChange', type: 'value callback', default: '-', description: '值变化回调。' },
  { name: 'open', type: 'boolean', default: '-', description: '受控展开状态。' },
  { name: 'defaultOpen', type: 'boolean', default: '-', description: '非受控初始展开状态。' },
  { name: 'onOpenChange', type: 'open callback', default: '-', description: '展开状态变化回调。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用组件。' }
]"/>

### SelectTrigger

<DataTable preset="props" :data="[
  { name: 'size', type: 'default | sm', default: 'default', description: '触发器尺寸。' },
  { name: 'endAdornment', type: 'ReactNode', default: '-', description: '右侧自定义内容，传入后会替换默认箭头。' },
  { name: 'className', type: 'string', default: '-', description: '触发器样式扩展。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '通常包含 SelectValue。' }
]"/>

### SelectContent

<DataTable preset="props" :data="[
  { name: 'position', type: 'item-aligned | popper', default: 'item-aligned', description: '浮层定位策略。' },
  { name: 'align', type: 'start | center | end', default: 'center', description: '浮层对齐方式。' },
  { name: 'className', type: 'string', default: '-', description: '浮层样式扩展。' }
]"/>

### SelectItem

<DataTable preset="props" :data="[
  { name: 'value', type: 'string', default: '-', description: '选项值。', required: true },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用当前选项。' },
  { name: 'className', type: 'string', default: '-', description: '选项样式扩展。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '选项显示内容。' }
]"/>

### SelectGroup / SelectLabel / SelectSeparator / SelectValue

<DataTable preset="props" :data="[
  { name: 'children', type: 'ReactNode', default: '-', description: '分组、标签、分隔线和显示值内容。' },
  { name: 'className', type: 'string', default: '-', description: '样式扩展。' },
  { name: '用途', type: '-', default: '-', description: '用于组织 Select 内容结构。' }
]"/>

## FAQ

### 如何给下拉项分组？

在 `SelectContent` 中使用 `SelectGroup` + `SelectLabel`，不同分组之间用 `SelectSeparator`。

### 如何替换默认下拉箭头？

给 `SelectTrigger` 传入 `endAdornment`。
