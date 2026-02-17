用于按时间顺序展示事件流，支持左右/交替布局与长列表折叠。

源码位置：`packages/ui/timeline.tsx`

## 何时使用

`Timeline` 适合表达时间先后关系和流程阶段。

- 发布、审批、工单处理过程
- 事件审计记录
- 生命周期里程碑展示

不建议使用场景：

- 需要复杂筛选排序的海量记录（建议使用表格）

## 代码演示

### 基础时间线

```playground
basic
```

### 交替布局

```playground
alternate
```

### 可折叠长列表

```playground
collapsible
```

## 属性说明 (API)

### Timeline

<DataTable preset="props" :data="[
  { name: 'items', type: 'TimelineItem[]', default: '-', description: '时间线项列表。' },
  { name: 'mode', type: 'left | right | alternate', default: 'left', description: '布局模式。' },
  { name: 'collapsible', type: 'boolean', default: 'false', description: '是否开启折叠。' },
  { name: 'collapseCount', type: 'number', default: '6', description: '折叠时保留的项数。' },
  { name: 'collapsed / defaultCollapsed', type: 'boolean', default: 'true', description: '受控/非受控折叠状态。' },
  { name: 'onCollapsedChange', type: '(collapsed: boolean) => void', default: '-', description: '折叠状态变化回调。' },
  { name: 'expandText / collapseText', type: 'ReactNode', default: '展开全部 / 收起', description: '折叠按钮文案。' }
]"/>

### TimelineItem

<DataTable preset="props" :data="[
  { name: 'title', type: 'ReactNode', default: '-', description: '事件标题。' },
  { name: 'description', type: 'ReactNode', default: '-', description: '事件描述。' },
  { name: 'time', type: 'ReactNode', default: '-', description: '时间信息。' },
  { name: 'dot', type: 'ReactNode', default: '-', description: '自定义节点圆点内容。' },
  { name: 'color', type: 'default | primary | success | warning | error | info', default: 'default', description: '节点语义色。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '额外内容块。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'TimelineMode', value: 'left | right | alternate' },
  { name: 'TimelineColor', value: 'default | primary | success | warning | error | info' },
  { name: 'TimelineItem', value: '{ title?; description?; time?; dot?; color?; children?; className? }' }
]"/>

## A11y

- 时间文案应完整可读，避免仅展示“刚刚/昨天”等相对词。
- 关键事件建议在描述中加入动作主体，便于审计追踪。
- 长时间线建议启用折叠，减少页面滚动负担。

## 常见问题 (FAQ)

### 什么时候用 `alternate` 模式？

当事件较多、需要提升可读层次时可用交替布局；移动端通常建议保持 `left`。

### 如何控制折叠开关状态？

使用 `collapsed` + `onCollapsedChange` 走受控模式。
