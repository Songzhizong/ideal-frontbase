用于展示状态、标签或轻量级计数信息，强调低成本识别而非复杂交互。

源码位置：`packages/ui/badge.tsx`

## 何时使用

`Badge` 适合承载短文本信息，常见于列表、卡片和详情页。

- 状态标识（如“已发布”“待审核”）
- 分类标签（如“前端”“高优先级”）
- 链接式辅助信息入口（通过 `asChild`）

不建议使用场景：

- 承载多行复杂内容或需要输入/编辑的场景

## 代码演示

### 变体

```playground
variants
```

### 搭配图标

```playground
with-icon
```

### 作为链接容器

```playground
as-link
```

## 属性说明 (API)

<DataTable preset="props" :data="[
  { name: 'variant', type: `'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'`, default: `'default'`, description: '徽标视觉变体。' },
  { name: 'asChild', type: 'boolean', default: 'false', description: '将样式注入子元素，例如 a 标签。' },
  { name: 'className', type: 'string', default: '-', description: '自定义样式类。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '徽标内容。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'BadgeVariant', value: `'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'` }
]"/>

## FAQ

### `Badge` 可以包裹链接吗？

可以，使用 `asChild` 把样式挂到 `a` 或 `BaseLink`。

```tsx
<Badge asChild variant="link">
  <a href="https://example.com">查看详情</a>
</Badge>
```

### 如何处理状态颜色？

优先使用语义化 `variant`，避免在业务层直接硬编码颜色类。
