用于承载一组结构化信息块，帮助页面内容形成可复用且清晰的视觉分区。

源码位置：`packages/ui/card.tsx`

## 何时使用

当页面包含多个信息模块，且每块都需要明确边界时使用 `Card`。

- 仪表盘统计卡片
- 详情摘要块
- 带表单/操作区的业务面板

不建议使用场景：

- 仅需简单文本分组且无边界需求的场景

## 代码演示

### 基础卡片

```playground
basic
```

### 标题区动作

```playground
with-action
```

### 带底部操作

```playground
with-footer
```

## 属性说明 (API)

### Card

<DataTable preset="props" :data="[
  { name: 'className', type: 'string', default: '-', description: '卡片容器样式。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '卡片内容结构。' },
  { name: '...divProps', type: 'React.ComponentProps<"div">', default: '-', description: '其余原生 div 属性。' }
]"/>

### CardHeader / CardContent / CardFooter

<DataTable preset="props" :data="[
  { name: 'className', type: 'string', default: '-', description: '区块样式扩展。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '区块内容。' },
  { name: '...divProps', type: 'React.ComponentProps<"div">', default: '-', description: '其余原生 div 属性。' }
]"/>

### CardTitle / CardDescription / CardAction

<DataTable preset="props" :data="[
  { name: 'className', type: 'string', default: '-', description: '标题、描述、动作区样式扩展。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '对应节点内容。' },
  { name: '...divProps', type: 'React.ComponentProps<"div">', default: '-', description: '其余原生 div 属性。' }
]"/>

## FAQ

### Card 一定要按固定子组件顺序使用吗？

不强制，但建议采用 `CardHeader` + `CardContent` + `CardFooter` 结构，保证信息层级一致。

### 如何在标题区右上角放按钮？

使用 `CardAction`，它会自动布局到标题区右侧。
