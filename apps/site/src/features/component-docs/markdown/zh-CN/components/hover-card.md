用于悬停触发的轻量信息卡片，适合简介预览和上下文说明。

源码位置：`packages/ui/hover-card.tsx`

## 何时使用

`HoverCard` 适合在不打断阅读流的前提下展示补充信息。

- 用户简介预览
- 标签说明卡片
- 轻量级对象信息提示

不建议使用场景：

- 关键操作确认或复杂交互流程

## 代码演示

### 基础悬停卡片

```playground
basic
```

### 个人资料预览

```playground
profile
```

### 延迟控制

```playground
delays
```

## 属性说明 (API)

### HoverCard

<DataTable preset="props" :data="[
  { name: 'open', type: 'boolean', default: '-', description: '受控打开状态。' },
  { name: 'defaultOpen', type: 'boolean', default: '-', description: '非受控初始状态。' },
  { name: 'onOpenChange', type: 'open callback', default: '-', description: '打开状态回调。' },
  { name: 'openDelay', type: 'number', default: '700', description: '打开延迟毫秒。' },
  { name: 'closeDelay', type: 'number', default: '300', description: '关闭延迟毫秒。' }
]"/>

### HoverCardContent

<DataTable preset="props" :data="[
  { name: 'align', type: 'start | center | end', default: 'center', description: '对齐方式。' },
  { name: 'sideOffset', type: 'number', default: '4', description: '偏移距离。' },
  { name: 'className', type: 'string', default: '-', description: '内容样式扩展。' }
]"/>

### HoverCardTrigger

<DataTable preset="props" :data="[
  { name: 'asChild', type: 'boolean', default: 'false', description: '将触发器行为注入子元素。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '触发内容。' },
  { name: 'className', type: 'string', default: '-', description: '触发器样式扩展。' }
]"/>

## FAQ

### HoverCard 支持点击打开吗？

默认交互是 hover/focus，若要点击触发可改用 `Popover`。

### 如何减少误触频繁闪烁？

适当增大 `openDelay` 并保持触发器区域稳定。
