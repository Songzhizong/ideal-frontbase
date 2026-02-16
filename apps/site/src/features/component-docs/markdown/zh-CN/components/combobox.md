用于将输入过滤与下拉选择组合在一起，支持搜索、分组、清空和受控值管理。

源码位置：`packages/ui/combobox.tsx`

## 何时使用

`Combobox` 适合“可搜索单选/多选”的候选项选择场景。

- 候选项较多，用户需要边输入边筛选
- 需要下拉分组与空状态提示
- 需要受控读写选中值

不建议使用场景：

- 选项很少且不需要搜索（可优先用 `Select`）

## 代码演示

### 基础用法

```playground
basic
```

### 分组选项

```playground
grouped
```

### 受控模式

```playground
controlled
```

## 属性说明 (API)

### Combobox

<DataTable preset="props" :data="[
  { name: 'value', type: 'any | null', default: '-', description: '受控选中值。' },
  { name: 'defaultValue', type: 'any | null', default: '-', description: '非受控初始值。' },
  { name: 'onValueChange', type: 'value callback', default: '-', description: '选中值变化回调。' },
  { name: 'items', type: 'array', default: '-', description: '可选项数据源。' },
  { name: 'multiple', type: 'boolean', default: 'false', description: '是否多选模式。' },
  { name: 'onInputValueChange', type: 'input callback', default: '-', description: '输入过滤值变化回调。' }
]"/>

### ComboboxInput

<DataTable preset="props" :data="[
  { name: 'showTrigger', type: 'boolean', default: 'true', description: '是否显示下拉触发按钮。' },
  { name: 'showClear', type: 'boolean', default: 'false', description: '是否显示清空按钮。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用输入。' },
  { name: 'placeholder', type: 'string', default: '-', description: '占位文案。' },
  { name: 'className', type: 'string', default: '-', description: '输入组样式扩展。' }
]"/>

### ComboboxContent

<DataTable preset="props" :data="[
  { name: 'side', type: 'top | right | bottom | left', default: 'bottom', description: '弹层方向。' },
  { name: 'align', type: 'start | center | end', default: 'start', description: '弹层对齐。' },
  { name: 'sideOffset', type: 'number', default: '6', description: '主轴偏移。' },
  { name: 'alignOffset', type: 'number', default: '0', description: '交叉轴偏移。' },
  { name: 'anchor', type: 'element ref', default: '-', description: '自定义定位锚点。' }
]"/>

### ComboboxItem

<DataTable preset="props" :data="[
  { name: 'value', type: 'any', default: '-', description: '选项值。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用当前选项。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '选项展示内容。' }
]"/>

## FAQ

### `Combobox` 和 `Select` 的区别是什么？

`Combobox` 强调输入过滤与搜索，`Select` 更适合固定列表直接选择。

### 如何接入远程搜索？

监听 `onInputValueChange`，在回调里请求后端并更新 `items` 或列表内容。
