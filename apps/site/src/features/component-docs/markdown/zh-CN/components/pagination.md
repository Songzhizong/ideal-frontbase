用于分页导航，支持上一页、下一页、页码链接和省略节点。

源码位置：`packages/ui/pagination.tsx`

## 何时使用

`Pagination` 适用于数据量较大且需要分批展示的场景。

- 列表页分页
- 日志/审计页分页
- 搜索结果分页

不建议使用场景：

- 数据量很小可一次性展示

## 代码演示

### 基础分页

```playground
basic
```

### 省略页码

```playground
with-ellipsis
```

### 紧凑移动端样式

```playground
compact-mobile
```

## 属性说明 (API)

### Pagination

<DataTable preset="props" :data="[
  { name: 'aria-label', type: 'string', default: 'pagination', description: '导航语义标签。' },
  { name: 'className', type: 'string', default: '-', description: '根容器样式扩展。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '分页结构内容。' }
]"/>

### PaginationLink

<DataTable preset="props" :data="[
  { name: 'isActive', type: 'boolean', default: 'false', description: '当前页激活状态。' },
  { name: 'size', type: 'ButtonSize', default: 'md', description: '链接尺寸。' },
  { name: 'href', type: 'string', default: '-', description: '跳转地址。' },
  { name: 'className', type: 'string', default: '-', description: '链接样式扩展。' }
]"/>

### PaginationPrevious / PaginationNext

<DataTable preset="props" :data="[
  { name: 'href', type: 'string', default: '-', description: '上一页或下一页地址。' },
  { name: 'aria-label', type: 'string', default: '内置默认值', description: '无障碍标签。' },
  { name: 'className', type: 'string', default: '-', description: '样式扩展。' }
]"/>

### PaginationEllipsis

<DataTable preset="props" :data="[
  { name: 'className', type: 'string', default: '-', description: '省略节点样式扩展。' },
  { name: 'children', type: 'ReactNode', default: '默认省略图标', description: '自定义省略内容。' },
  { name: '用途', type: '-', default: '-', description: '当页码过多时压缩显示。' }
]"/>

## FAQ

### 需要接入路由时怎么做？

`PaginationLink` 默认是 `a`，可按需改为 `asChild` 封装或在外层做路由跳转映射。

### 省略节点什么时候出现？

当总页数较大且只展示部分页码时，使用 `PaginationEllipsis` 表示中间区间省略。
