用于互斥单选场景，确保同一组内只能选择一个选项。

源码位置：`packages/ui/radio-group.tsx`

## 何时使用

`RadioGroup` 适合选项数量有限且需要明确比较的单选场景。

- 策略切换（自动 / 手动）
- 套餐或规格选择
- 视图模式切换

不建议使用场景：

- 选项很多或需要搜索（建议使用 `Select`）

## 代码演示

### 基础单选组

```playground
basic
```

### 卡片化选项

```playground
card-options
```

### 受控模式

```playground
controlled
```

## 属性说明 (API)

### RadioGroup

<DataTable preset="props" :data="[
  { name: 'value', type: 'string', default: '-', description: '受控选中值。' },
  { name: 'defaultValue', type: 'string', default: '-', description: '非受控初始值。' },
  { name: 'onValueChange', type: 'value callback', default: '-', description: '值变化回调。' },
  { name: 'name', type: 'string', default: '-', description: '表单字段名。' },
  { name: 'required', type: 'boolean', default: 'false', description: '是否必选。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用整组。' },
  { name: 'className', type: 'string', default: '-', description: '容器样式扩展。' }
]"/>

### RadioGroupItem

<DataTable preset="props" :data="[
  { name: 'value', type: 'string', default: '-', description: '选项值。', required: true },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用当前选项。' },
  { name: 'id', type: 'string', default: '-', description: '用于与 Label 关联。' },
  { name: 'className', type: 'string', default: '-', description: '选项样式扩展。' }
]"/>

## FAQ

### 单选项文案点击无效怎么办？

使用 `Label htmlFor` 关联 `RadioGroupItem` 的 `id`。

### 如何读取当前选中值？

在受控模式中通过 `value` 和 `onValueChange` 管理。
