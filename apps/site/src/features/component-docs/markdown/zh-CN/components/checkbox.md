用于多选场景，支持选中、未选中和半选状态。

源码位置：`packages/ui/checkbox.tsx`

## 何时使用

`Checkbox` 适用于“可多选”的业务交互。

- 权限勾选
- 通知偏好设置
- 批量选择列表项

不建议使用场景：

- 互斥单选场景（建议使用 `RadioGroup`）

## 代码演示

### 基础勾选

```playground
basic
```

### 半选状态

```playground
indeterminate
```

### 表单清单

```playground
checklist-form
```

## 属性说明 (API)

<DataTable preset="props" :data="[
  { name: 'checked', type: 'boolean | indeterminate', default: '-', description: '受控选中状态。' },
  { name: 'defaultChecked', type: 'boolean', default: '-', description: '非受控初始状态。' },
  { name: 'onCheckedChange', type: 'checked callback', default: '-', description: '状态变化回调。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用勾选。' },
  { name: 'required', type: 'boolean', default: 'false', description: '是否为必填项。' },
  { name: 'name', type: 'string', default: '-', description: '表单字段名。' },
  { name: 'value', type: 'string', default: '-', description: '表单提交值。' },
  { name: 'className', type: 'string', default: '-', description: '样式扩展。' }
]"/>

## FAQ

### 如何实现“全选/半选”？

父级 `checked` 根据子项数量计算为 `true`、`false` 或 `indeterminate`。

### 如何与 Label 正确关联？

给 `Checkbox` 设置 `id`，并让 `Label` 的 `htmlFor` 指向该 `id`。
