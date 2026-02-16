提供表格、卡片、表单、详情等高频骨架屏预设，减少重复拼装占位结构。

源码位置：`packages/ui/skeleton-presets.tsx`

## 何时使用

当页面结构固定、重复率高时，优先使用预设骨架而非手写零散 `Skeleton`。

- 列表页初始加载
- 仪表盘卡片区加载
- 表单/详情页请求中

不建议使用场景：

- 页面布局高度动态且预设结构不匹配

## 代码演示

### 表格 + 卡片预设

```playground
table-and-cards
```

### 表单 + 详情预设

```playground
form-and-detail
```

## 属性说明 (API)

### TableSkeleton

<DataTable preset="props" :data="[
  { name: 'rows', type: 'number', default: '5', description: '数据行数量，最小为 1。' },
  { name: 'columns', type: 'number', default: '4', description: '列数量，最小为 1。' },
  { name: 'showHeader', type: 'boolean', default: 'true', description: '是否显示表头占位。' }
]"/>

### CardSkeleton

<DataTable preset="props" :data="[
  { name: 'cards', type: 'number', default: '3', description: '卡片数量，最小为 1。' },
  { name: 'className', type: 'string', default: '-', description: '自定义布局样式。' },
  { name: '...divProps', type: 'React.ComponentProps<"div">', default: '-', description: '其余原生 div 属性。' }
]"/>

### FormSkeleton / DetailSkeleton

<DataTable preset="props" :data="[
  { name: 'rows', type: 'number', default: 'Form=4 / Detail=6', description: '字段或详情行数量，最小为 1。' },
  { name: 'actions', type: 'boolean', default: 'true（仅 FormSkeleton）', description: '是否显示表单底部操作占位。' },
  { name: 'className', type: 'string', default: '-', description: '容器样式扩展。' }
]"/>

## FAQ

### 预设骨架支持响应式吗？

支持，内部已使用响应式网格与容器宽度策略，可按需通过 `className` 继续调整。

### 如果预设不满足需求怎么办？

先组合多个预设；仍不满足时回退到基础 `Skeleton` 手动拼装。
