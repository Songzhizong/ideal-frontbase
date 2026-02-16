用于在受限容器中展示可滚动内容，支持纵向、横向和双轴滚动条。

源码位置：`packages/ui/scroll-area.tsx`

## 何时使用

`ScrollArea` 适合内容尺寸不确定、需要固定容器高度或宽度的场景。

- 日志流、消息流、长列表浏览
- 横向看板或时间轴溢出内容
- 表格/矩阵内容需要双轴滚动

不建议使用场景：

- 页面主滚动容器（优先使用浏览器原生页面滚动）

## 代码演示

### 纵向滚动列表

```playground
vertical-list
```

### 横向看板滚动

```playground
horizontal-board
```

### 双轴滚动

```playground
both-axes
```

## 属性说明 (API)

### ScrollArea

<DataTable preset="props" :data="[
  { name: 'scrollbars', type: 'vertical | horizontal | both | none', default: 'vertical', description: '滚动条方向策略。' },
  { name: 'viewportRef', type: 'React.Ref<HTMLDivElement>', default: '-', description: '视口节点引用，便于外部滚动控制。' },
  { name: 'viewportClassName', type: 'string', default: '-', description: '视口区域样式扩展。' },
  { name: 'className', type: 'string', default: '-', description: '根容器样式扩展。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '滚动内容。' },
  { name: '...props', type: 'React.ComponentProps<typeof ScrollAreaPrimitive.Root>', default: '-', description: '透传 Radix ScrollArea Root 属性。' }
]"/>

### ScrollBar

<DataTable preset="props" :data="[
  { name: 'orientation', type: 'vertical | horizontal', default: 'vertical', description: '滚动条方向。' },
  { name: 'className', type: 'string', default: '-', description: '滚动条样式扩展。' },
  { name: '...props', type: 'React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>', default: '-', description: '透传原生滚动条属性。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'ScrollAreaProps.scrollbars', value: 'vertical | horizontal | both | none' },
  { name: 'ScrollAreaProps.viewportRef', value: 'React.Ref<HTMLDivElement>' },
  { name: 'ScrollAreaProps.viewportClassName', value: 'string' }
]"/>

## A11y

- 容器可聚焦时建议补充可见标题或 `aria-label`，说明滚动区域用途。
- 双轴滚动场景建议固定列标题，减少可读性损失。
- 内容中含交互元素时，确保键盘焦点可进入并可退出滚动区域。

## 常见问题 (FAQ)

### 如何只显示横向滚动条？

设置 `scrollbars="horizontal"`，并保证内容宽度超过容器。

### 如何在外部按钮点击后滚动到顶部？

通过 `viewportRef` 获取视口节点，再调用 `scrollTo`。
