用于生成页内锚点导航，跟随滚动高亮当前章节，并支持平滑滚动。

源码位置：`packages/ui/anchor.tsx`

## 何时使用

`Anchor` 适合长文档、说明页、配置页的目录导航。

- 组件文档页内导航
- 长表单章节导航
- 知识库文章目录

不建议使用场景：

- 短页面或只有一两个章节的内容

## 代码演示

### 基础锚点

```playground
basic
```

### 嵌套目录

```playground
nested
```

### 自定义滚动容器

```playground
custom-container
```

## 属性说明 (API)

### Anchor

<DataTable preset="props" :data="[
  { name: 'items', type: 'AnchorItem[]', default: '-', description: '锚点数据源。', required: true },
  { name: 'offset', type: 'number', default: '12', description: '滚动偏移量。' },
  { name: 'affix', type: 'boolean', default: 'true', description: '是否 sticky 固定。' },
  { name: 'target', type: 'container getter', default: 'window', description: '滚动容器获取函数。' },
  { name: 'onChange', type: 'href callback', default: '-', description: '激活锚点变化回调。' },
  { name: 'className', type: 'string', default: '-', description: '导航容器样式扩展。' }
]"/>

### AnchorLink

<DataTable preset="props" :data="[
  { name: 'href', type: 'string', default: '-', description: '目标锚点地址。', required: true },
  { name: 'title', type: 'ReactNode', default: '-', description: '显示标题。', required: true },
  { name: 'active', type: 'boolean', default: 'false', description: '激活状态。' },
  { name: 'level', type: 'number', default: '0', description: '层级缩进。' },
  { name: 'disabled', type: 'boolean', default: 'false', description: '禁用跳转。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'AnchorItem', value: '{ href: string; title: ReactNode; key?: Key; children?: AnchorItem[]; disabled?: boolean }' }
]"/>

## FAQ

### `href` 支持什么格式？

支持 `#id` 和 `querySelector` 可识别的选择器。

### 为什么点击不滚动？

请确认目标元素存在且 `id/selector` 与 `href` 完全匹配。
