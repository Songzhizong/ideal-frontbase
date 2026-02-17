用于表示当前页面在信息架构中的位置，帮助用户理解层级与快速回退。

源码位置：`packages/ui/breadcrumb.tsx`

## 何时使用

`Breadcrumb` 适合层级型导航结构。

- 多级目录页面
- 详情页回溯入口
- 文档站点路径提示

不建议使用场景：

- 扁平单层页面，无明显父子层级关系

## 代码演示

### 基础路径

```playground
basic
```

### 长路径省略

```playground
with-ellipsis
```

### 自定义分隔符

```playground
custom-separator
```

## 属性说明 (API)

### Breadcrumb

<DataTable preset="props" :data="[
  { name: 'aria-label', type: 'string', default: 'breadcrumb', description: '导航语义标签。' },
  { name: 'className', type: 'string', default: '-', description: '根容器样式扩展。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '面包屑结构内容。' }
]"/>

### BreadcrumbLink

<DataTable preset="props" :data="[
  { name: 'asChild', type: 'boolean', default: 'false', description: '将样式注入子组件。' },
  { name: 'href', type: 'string', default: '-', description: '链接地址。' },
  { name: 'className', type: 'string', default: '-', description: '链接样式扩展。' }
]"/>

### BreadcrumbPage / BreadcrumbSeparator / BreadcrumbEllipsis

<DataTable preset="props" :data="[
  { name: 'children', type: 'ReactNode', default: '-', description: '当前页文本、分隔符或省略符内容。' },
  { name: 'className', type: 'string', default: '-', description: '样式扩展。' },
  { name: '用途', type: '-', default: '-', description: '分别用于当前页、路径分隔与长路径折叠。' }
]"/>

## FAQ

### Breadcrumb 链接推荐用什么组件？

站内路由推荐配合 `BaseLink`，避免硬编码地址。

### 什么时候使用省略节点？

路径层级超过 3 到 4 层时可用 `BreadcrumbEllipsis` 压缩展示。
