基于原生 `select` 封装，保持浏览器原生语义和表单兼容性，同时提供统一样式。

源码位置：`packages/ui/native-select.tsx`

## 何时使用

当你需要原生表单行为或极简依赖时，优先使用 `NativeSelect`。

- 传统表单提交
- 对浏览器原生行为兼容性要求高的场景
- 简单枚举选择

不建议使用场景：

- 需要复杂浮层定制或高级交互（建议使用 `Select`）

## 代码演示

### 基础用法

```playground
basic
```

### 分组选项

```playground
with-optgroup
```

### 尺寸与状态

```playground
states
```

## 属性说明 (API)

### NativeSelect

<DataTable preset="props" :data="[
  { name: 'size', type: 'default | sm', default: 'default', description: '选择器尺寸。' },
  { name: 'value', type: 'string', default: '-', description: '受控值。' },
  { name: 'defaultValue', type: 'string', default: '-', description: '非受控初始值。' },
  { name: 'onChange', type: 'event callback', default: '-', description: '值变化回调。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用状态。' },
  { name: 'required', type: 'boolean', default: 'false', description: '是否必填。' },
  { name: 'name', type: 'string', default: '-', description: '表单字段名。' },
  { name: 'aria-invalid', type: 'boolean', default: 'false', description: '校验失败状态。' },
  { name: 'className', type: 'string', default: '-', description: '样式扩展。' }
]"/>

### NativeSelectOption / NativeSelectOptGroup

<DataTable preset="props" :data="[
  { name: 'value', type: 'string', default: '-', description: '选项值（Option）。' },
  { name: 'label', type: 'string', default: '-', description: '分组标签（OptGroup）。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '是否禁用选项或分组。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '显示文本内容。' }
]"/>

## FAQ

### `NativeSelect` 和 `Select` 怎么选？

优先判断需求复杂度：原生兼容与简单场景选 `NativeSelect`，定制化交互选 `Select`。

### 如何与后端传统表单提交对接？

设置 `name` 和 `value` 后可直接参与原生 form 提交。
