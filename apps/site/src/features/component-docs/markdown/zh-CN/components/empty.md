用于展示“无数据/无结果/无权限”等空状态，帮助用户理解当前状态并给出下一步动作。

源码位置：`packages/ui/empty.tsx`

## 何时使用

`Empty` 适合在内容区域无可展示数据时作为占位反馈。

- 列表初始为空（未创建任何数据）
- 搜索与筛选后无匹配结果
- 权限或条件不足导致当前区域不可用

不建议使用场景：

- 请求仍在加载中（建议使用 `Skeleton` 或 `Spinner`）

## 代码演示

### 基础空态

```playground
basic
```

### 图标变体

```playground
icon-variant
```

### 带操作区

```playground
with-actions
```

### 搜索无结果

```playground
search-empty
```

## 属性说明 (API)

### Empty

<DataTable preset="props" :data="[
  { name: 'className', type: 'string', default: '-', description: '根容器样式扩展。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '空态内容结构。' },
  { name: '...props', type: 'React.ComponentProps<"div">', default: '-', description: '透传 div 原生属性。' }
]"/>

### EmptyHeader / EmptyContent / EmptyTitle / EmptyDescription

<DataTable preset="props" :data="[
  { name: 'className', type: 'string', default: '-', description: '子区域样式扩展。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '标题、描述或操作区内容。' },
  { name: '...props', type: 'React.ComponentProps<"div"> / React.ComponentProps<"p">', default: '-', description: '透传原生属性。' }
]"/>

### EmptyMedia

<DataTable preset="props" :data="[
  { name: 'variant', type: 'default | icon', default: 'default', description: '媒体区域样式变体；`icon` 会渲染方形图标容器。' },
  { name: 'className', type: 'string', default: '-', description: '媒体容器样式扩展。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '可放置图标、插图等内容。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'EmptyMedia.variant', value: 'default | icon' },
  { name: 'Empty', value: 'React.ComponentProps<"div">' },
  { name: 'EmptyDescription', value: 'React.ComponentProps<"p">（实现层渲染为块级容器）' }
]"/>

## 组合建议

推荐结构：`Empty` → `EmptyHeader` → `EmptyTitle + EmptyDescription` → `EmptyContent`。

- `EmptyHeader` 放核心信息（标题、描述、图标）。
- `EmptyContent` 放操作按钮、帮助链接或补充说明。
- 需要图标时优先使用 `EmptyMedia variant="icon"`，保证视觉一致。

## A11y

- 标题与描述应直接表达当前空态原因，避免只放装饰图形。
- 如果有后续操作（如“创建”“重试”），按钮文案应是动词短语。
- 链接类引导建议使用语义化导航组件（如 `BaseLink`）。

## 常见问题 (FAQ)

### 空态里可以放按钮和链接吗？

可以，建议放在 `EmptyContent` 区域，避免与标题描述混在一起。

### 何时使用 `variant="icon"`？

当你只有一个图标，不需要自定义插图尺寸时使用该变体，可获得统一的容器样式与对齐表现。
