用于在两列列表之间迁移数据，适合成员分配、权限授权、资源绑定等场景。

源码位置：`packages/ui/transfer.tsx`

## 何时使用

`Transfer` 适合“从候选集选择子集”的交互。

- 项目成员分配
- 权限项授权/回收
- 服务、标签、资源的双向绑定

不建议使用场景：

- 只有少量选项且无需左右对照（建议用多选 `Select`）

## 代码演示

### 基础迁移

```playground
basic
```

### 可搜索迁移

```playground
searchable
```

### 自定义项渲染

```playground
custom-render
```

## 属性说明 (API)

### Transfer

<DataTable preset="props" :data="[
  { name: 'dataSource', type: 'TransferItem[]', default: '-', description: '源数据列表，必填。' },
  { name: 'targetKeys / defaultTargetKeys', type: 'string[]', default: '-', description: '目标列表 key（受控/非受控）。' },
  { name: 'onChange', type: '(targetKeys, movedKeys, direction) => void', default: '-', description: '迁移后回调。' },
  { name: 'searchable', type: 'boolean', default: 'true', description: '是否启用两侧搜索。' },
  { name: 'renderItem', type: '(item: TransferItem) => ReactNode', default: '-', description: '自定义列表项渲染。' },
  { name: 'sourceTitle / targetTitle', type: 'ReactNode', default: '源列表 / 目标列表', description: '左右列表标题。' },
  { name: 'sourceEmptyText / targetEmptyText', type: 'ReactNode', default: '暂无可选项 / 暂无已选项', description: '左右空态文案。' },
  { name: 'className', type: 'string', default: '-', description: '容器样式扩展。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'TransferItem', value: '{ key: string; title: ReactNode; description?; disabled? }' },
  { name: 'TransferProps.onChange', value: '(targetKeys: string[], movedKeys: string[], direction: "left" | "right") => void' },
  { name: 'CheckedState', value: 'boolean | "indeterminate"（内部全选状态）' }
]"/>

## A11y

- 列表项建议提供可读标题，避免只渲染图标。
- 大量数据时请开启搜索，降低键盘导航成本。
- 禁用项应在视觉与交互上同时体现不可操作状态。

## 常见问题 (FAQ)

### 如何知道本次是左移还是右移？

在 `onChange` 的第三个参数 `direction` 中判断：`"right"` 表示加入目标列表，`"left"` 表示移回源列表。

### 可以自定义列表项内容吗？

可以，通过 `renderItem` 返回任意 React 节点。
