用于树形结构选择，支持单选、多选、节点搜索与标签化展示。

源码位置：`packages/ui/tree-select.tsx`

## 何时使用

`TreeSelect` 适合层级节点较深、需要按树结构选择的场景。

- 组织/部门节点选择
- 菜单权限节点分配
- 区域、资源组等层级数据筛选

不建议使用场景：

- 选项无层级关系（建议使用 `Select` 或 `Combobox`）

## 代码演示

### 基础单选

```playground
basic
```

### 多选勾选

```playground
multiple
```

### 搜索过滤

```playground
searchable
```

## 属性说明 (API)

### TreeSelect

<DataTable preset="props" :data="[
  { name: 'treeData', type: 'TreeDataNode[]', default: '-', description: '树结构数据，必填。' },
  { name: 'value / defaultValue', type: 'TreeSelectValue', default: '-', description: '受控/非受控选中值。' },
  { name: 'onChange', type: '(value, selectedNodes) => void', default: '-', description: '值变化回调。' },
  { name: 'multiple', type: 'boolean', default: 'false', description: '是否启用多选（勾选模式）。' },
  { name: 'searchable', type: 'boolean', default: 'true', description: '是否启用关键字搜索。' },
  { name: 'allowClear', type: 'boolean', default: 'true', description: '是否显示清空按钮。' },
  { name: 'maxTagCount', type: 'number', default: '2', description: '多选时标签显示上限。' },
  { name: 'treeHeight', type: 'number', default: '280', description: '树容器高度。' },
  { name: 'placeholder / emptyText', type: 'ReactNode', default: '请选择 / 暂无数据', description: '占位与空态文案。' },
  { name: 'popoverClassName', type: 'string', default: '-', description: '弹层样式扩展。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用状态。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'TreeSelectValue', value: 'TreeKey | TreeKey[] | undefined' },
  { name: 'TreeSelectProps', value: 'treeData + value/defaultValue + onChange + multiple/searchable options' },
  { name: 'TreeDataNode', value: '{ key; title; children?; disabled?; selectable?; checkable?; ... }' }
]"/>

## A11y

- 触发器使用 `combobox` 语义，建议配合字段标签说明。
- 多选模式下标签移除按钮需要清晰 `aria-label`。
- 树层级较深时建议提供搜索，降低键盘导航成本。

## 常见问题 (FAQ)

### 单选和多选返回值怎么区分？

单选返回 `string | undefined`，多选返回 `string[]`。

### 如何限制弹层高度并启用虚拟滚动？

通过 `treeHeight` 控制高度，内部 `Tree` 已启用 `virtual` 渲染。
