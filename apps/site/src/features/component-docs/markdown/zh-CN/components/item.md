用于构建可复用的信息行结构，支持媒体区、标题描述、操作区和分组分隔。

源码位置：`packages/ui/item.tsx`

## 何时使用

`Item` 适合“行式信息 + 行内操作”的组合场景。

- 设置中心条目
- 列表项的摘要展示
- 通知/事件流条目

不建议使用场景：

- 复杂二维数据表格（建议使用 `Table`）

## 代码演示

### 基础信息项

```playground
basic
```

### 媒体区与操作区

```playground
media-actions
```

### 分组与分隔线

```playground
group-with-separator
```

## 属性说明 (API)

### Item

<DataTable preset="props" :data="[
  { name: 'variant', type: `'default' | 'outline' | 'muted'`, default: `'default'`, description: '行项视觉样式。' },
  { name: 'size', type: `'default' | 'sm'`, default: `'default'`, description: '行项尺寸与间距。' },
  { name: 'asChild', type: 'boolean', default: 'false', description: '将样式注入子元素。' },
  { name: 'className', type: 'string', default: '-', description: '自定义样式。' }
]"/>

### ItemMedia

<DataTable preset="props" :data="[
  { name: 'variant', type: `'default' | 'icon' | 'image'`, default: `'default'`, description: '媒体区样式变体。' },
  { name: 'className', type: 'string', default: '-', description: '媒体区样式扩展。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '图标或图片内容。' }
]"/>

### ItemContent / ItemTitle / ItemDescription / ItemActions / ItemGroup / ItemSeparator

<DataTable preset="props" :data="[
  { name: 'children', type: 'ReactNode', default: '-', description: '对应区块内容。' },
  { name: 'className', type: 'string', default: '-', description: '区块样式扩展。' },
  { name: '...nativeProps', type: 'React.ComponentProps<"div" | "ul" | "p">', default: '-', description: '其余原生属性。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'ItemVariant', value: `'default' | 'outline' | 'muted'` },
  { name: 'ItemSize', value: `'default' | 'sm'` },
  { name: 'ItemMediaVariant', value: `'default' | 'icon' | 'image'` }
]"/>

## FAQ

### Item 可以渲染成链接吗？

可以，`Item` 支持 `asChild`，可把样式注入 `a` 或 `BaseLink`。

### 需要分组展示时怎么做？

使用 `ItemGroup` 包裹多条 `Item`，并在中间插入 `ItemSeparator`。
