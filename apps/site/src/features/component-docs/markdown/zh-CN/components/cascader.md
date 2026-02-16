用于多级联动选择，适合组织树、地域层级、分类路径等层级数据输入。

源码位置：`packages/ui/cascader.tsx`

## 何时使用

`Cascader` 适合“逐层选择路径”的输入场景。

- 省/市/区、业务线/应用/模块等层级选择
- 类目路径选择（支持多选路径）
- 需要按关键词搜索整条路径的场景

不建议使用场景：

- 只有单层选项（建议使用 `Select`）

## 代码演示

### 基础单选

```playground
basic
```

### 多选路径

```playground
multiple
```

### 异步加载子节点

```playground
async-load
```

## 属性说明 (API)

### Cascader

<DataTable preset="props" :data="[
  { name: 'options', type: 'CascaderOption[]', default: '-', description: '层级选项数据，必填。' },
  { name: 'value / defaultValue', type: 'CascaderValue', default: '-', description: '受控/非受控值。' },
  { name: 'onChange', type: 'single: (value, selectedOptions) | multiple: (value, selectedOptions)', default: '-', description: '值变化回调，签名随 `multiple` 不同。' },
  { name: 'multiple', type: 'boolean', default: 'false', description: '是否开启多选路径。' },
  { name: 'searchable', type: 'boolean', default: 'true', description: '是否启用搜索。' },
  { name: 'loadData', type: '(selectedOptions) => Promise<CascaderOption[] | undefined>', default: '-', description: '懒加载子节点。' },
  { name: 'allowClear', type: 'boolean', default: 'true', description: '是否显示清空按钮。' },
  { name: 'maxTagCount', type: 'number', default: '2', description: '多选时标签显示上限。' },
  { name: 'placeholder / emptyText', type: 'ReactNode', default: '请选择 / 暂无可选项', description: '占位与空态文案。' },
  { name: 'popoverClassName', type: 'string', default: '-', description: '弹层样式扩展。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用输入。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'CascaderOption', value: '{ value; label; children?; disabled?; isLeaf?; className? }' },
  { name: 'CascaderSingleValue', value: 'string[]' },
  { name: 'CascaderMultiValue', value: 'string[][]' },
  { name: 'CascaderValue', value: 'CascaderSingleValue | CascaderMultiValue | undefined' }
]"/>

## A11y

- 触发器使用 `combobox` 语义，建议补充上下文标签。
- 多选模式下移除标签按钮应保留可读 `aria-label`。
- 层级较深时建议在旁显示完整路径，避免用户丢失上下文。

## 常见问题 (FAQ)

### 单选和多选模式的值结构有什么区别？

单选是 `string[]`（一条路径），多选是 `string[][]`（多条路径）。

### 如何按需加载下一级选项？

提供 `loadData`，在用户展开某节点时异步返回其子节点数组。
