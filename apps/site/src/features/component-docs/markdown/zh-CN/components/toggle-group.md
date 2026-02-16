用于管理一组互相关联的 `Toggle`，支持单选或多选模式。

源码位置：`packages/ui/toggle-group.tsx`

## 何时使用

`ToggleGroup` 适合同一语义下的多项切换。

- 文本对齐（左/中/右）单选
- 样式工具（粗体/斜体/下划线）多选
- 列表筛选（全部/启用/停用）

不建议使用场景：

- 选项数量很大且需要搜索（建议使用 `Select` 或 `Combobox`）

## 代码演示

### 单选模式

```playground
single
```

### 多选模式

```playground
multiple
```

### 间距与拼接样式

```playground
spacing-and-outline
```

## 属性说明 (API)

### ToggleGroup

<DataTable preset="props" :data="[
  { name: 'type', type: 'single | multiple', default: '-', description: '选择模式，必填。' },
  { name: 'value', type: 'string | string[]', default: '-', description: '受控值。' },
  { name: 'defaultValue', type: 'string | string[]', default: '-', description: '非受控初始值。' },
  { name: 'onValueChange', type: '(value) => void', default: '-', description: '选中值变化回调。' },
  { name: 'variant', type: 'default | outline', default: 'default', description: '组内项视觉变体。' },
  { name: 'size', type: 'sm | default | lg', default: 'default', description: '组内项尺寸。' },
  { name: 'spacing', type: 'number', default: '0', description: '项间距；`0` 时形成拼接按钮效果。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用整个分组。' },
  { name: 'orientation', type: 'horizontal | vertical', default: 'horizontal', description: '分组方向。' }
]"/>

### ToggleGroupItem

<DataTable preset="props" :data="[
  { name: 'value', type: 'string', default: '-', description: '选项值，必填。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用当前项。' },
  { name: 'variant', type: 'default | outline', default: '跟随组配置', description: '覆盖组级变体。' },
  { name: 'size', type: 'sm | default | lg', default: '跟随组配置', description: '覆盖组级尺寸。' },
  { name: 'className', type: 'string', default: '-', description: '项样式扩展。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'ToggleGroupProps', value: 'React.ComponentProps<typeof ToggleGroupPrimitive.Root> & { spacing?: number } & Toggle variants' },
  { name: 'ToggleGroupItemProps', value: 'React.ComponentProps<typeof ToggleGroupPrimitive.Item> & Toggle variants' },
  { name: 'spacing', value: 'number（写入 CSS 变量 `--gap`）' }
]"/>

## A11y

- 对仅图标项必须提供 `aria-label`。
- 使用 `type="single"` 时，建议为整组增加语义标题，帮助用户理解选择范围。
- 多选模式建议在外部同步显示已选结果，降低误操作成本。

## 常见问题 (FAQ)

### 如何做“按钮拼接”效果？

设置 `spacing={0}`，并配合 `variant="outline"`。

### 单选模式下如何允许“取消选中”？

`ToggleGroup` 单选模式默认不支持空值回退；若需可取消，可在受控模式下自行处理 `onValueChange`。
