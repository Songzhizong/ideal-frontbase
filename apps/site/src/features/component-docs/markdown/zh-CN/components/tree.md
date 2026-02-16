用于树形数据展示与交互，支持选择、勾选、展开、拖拽与虚拟滚动。

源码位置：`packages/ui/tree.tsx`

## 何时使用

`Tree` 适合层级数据管理与节点操作场景。

- 菜单/目录结构管理
- 权限节点分配
- 组织架构与资源树展示

不建议使用场景：

- 扁平列表展示（建议使用表格或列表）

## 代码演示

### 基础选择

```playground
basic
```

### 勾选模式

```playground
checkable
```

### 拖拽调整结构

```playground
draggable
```

## 属性说明 (API)

### Tree

<DataTable preset="props" :data="[
  { name: 'treeData', type: 'TreeDataNode[]', default: '-', description: '树数据源，必填。' },
  { name: 'selectedKeys / defaultSelectedKeys', type: 'TreeKey[]', default: '-', description: '受控/非受控选中节点。' },
  { name: 'checkedKeys / defaultCheckedKeys', type: 'TreeKey[]', default: '-', description: '受控/非受控勾选节点。' },
  { name: 'expandedKeys / defaultExpandedKeys', type: 'TreeKey[]', default: '-', description: '受控/非受控展开节点。' },
  { name: 'onSelect / onCheck / onExpand', type: 'callbacks', default: '-', description: '选择、勾选、展开事件回调。' },
  { name: 'onDrop', type: '(info: TreeDropInfo) => void', default: '-', description: '拖拽落点回调。' },
  { name: 'checkable', type: 'boolean', default: 'false', description: '是否显示复选框。' },
  { name: 'multiple', type: 'boolean', default: 'false', description: '是否支持多选节点。' },
  { name: 'draggable', type: 'boolean', default: 'false', description: '是否允许拖拽。' },
  { name: 'virtual', type: 'boolean', default: 'false', description: '是否启用虚拟滚动。' },
  { name: 'height / itemHeight', type: 'number', default: '320 / 36', description: '虚拟列表高度与行高。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'TreeDataNode', value: '{ key; title; children?; disabled?; disableCheckbox?; selectable?; checkable?; ... }' },
  { name: 'TreeProps', value: 'treeData + selected/checked/expanded controlled props + callbacks' },
  { name: 'TreeDropInfo', value: '{ dragKey; dropKey; dropPosition; dragNode; dropNode; treeData }' }
]"/>

## A11y

- 内置键盘导航（上下左右、Enter/Space），适合无鼠标操作。
- 树节点标题应具有可读文本，避免仅图标。
- 大树建议启用 `virtual` 并控制高度，保持滚动性能。

## 常见问题 (FAQ)

### 勾选父节点时为什么子节点也会变化？

组件默认级联勾选，会同步子节点并回算父节点状态。

### 拖拽后如何持久化结构？

在 `onDrop` 中读取 `info.treeData` 并提交到后端或本地状态存储。
