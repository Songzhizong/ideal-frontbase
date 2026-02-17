用于键值对信息展示，适合详情页、配置面板、资源属性等结构化说明。

源码位置：`packages/ui/description-list.tsx`

## 何时使用

`DescriptionList` 适合“字段名 + 字段值”形式的信息阅读。

- 资源详情页基础信息
- 发布记录或运行配置摘要
- 审计条目属性查看

不建议使用场景：

- 大规模可排序/筛选数据（建议使用 `Table`）

## 代码演示

### items 数据驱动

```playground
items
```

### children 组合写法

```playground
custom-children
```

### 纵向边框样式

```playground
vertical
```

## 属性说明 (API)

### DescriptionList

<DataTable preset="props" :data="[
  { name: 'items', type: 'DescriptionListItem[]', default: '-', description: '数据驱动项列表。' },
  { name: 'children', type: 'ReactNode', default: '-', description: '手工组合 `DescriptionItem`。' },
  { name: 'column', type: '1 | 2 | 3', default: '1', description: '列数布局。' },
  { name: 'orientation', type: 'horizontal | vertical', default: 'horizontal', description: '标签和值排列方向。' },
  { name: 'bordered', type: 'boolean', default: 'false', description: '是否显示卡片边框样式。' },
  { name: 'empty', type: 'ReactNode', default: '--', description: '全局空值占位。' }
]"/>

### DescriptionItem

<DataTable preset="props" :data="[
  { name: 'label', type: 'ReactNode', default: '-', description: '字段标签，必填。' },
  { name: 'value', type: 'ReactNode', default: '-', description: '字段值。' },
  { name: 'span', type: '1 | 2 | 3', default: '1', description: '跨列数。' },
  { name: 'empty', type: 'ReactNode', default: '继承列表 empty', description: '当前项空值占位。' },
  { name: 'labelClassName / valueClassName', type: 'string', default: '-', description: '标签和值样式扩展。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'DescriptionListItem', value: '{ label; value?; span?; className?; labelClassName?; valueClassName?; empty? }' },
  { name: 'DescriptionListColumn', value: '1 | 2 | 3' },
  { name: 'DescriptionListOrientation', value: 'horizontal | vertical' }
]"/>

## A11y

- 标签文案需明确，避免使用模糊缩写。
- 对空值统一展示占位符，减少“字段缺失”的误读。
- 值为链接或按钮时，确保交互元素焦点样式可见。

## 常见问题 (FAQ)

### `items` 和 `children` 该选哪个？

纯数据渲染优先 `items`；需要插入复杂 JSX（徽标、按钮）时用 `children` + `DescriptionItem`。

### 如何让某一项占满整行？

给 `DescriptionItem` 设置 `span`，并确保不超过当前 `column`。
