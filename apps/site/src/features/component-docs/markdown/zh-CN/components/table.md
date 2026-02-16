用于结构化数据展示，提供语义化表格子组件与横向滚动容器封装。

源码位置：`packages/ui/table.tsx`

## 何时使用

`Table` 适合字段列明确、需要按行对比的数据展示。

- 服务/任务/资源列表
- 报表与统计明细
- 带汇总行的费用/计量数据

不建议使用场景：

- 信息块布局且字段数量很少（建议使用 `DescriptionList`）

## 代码演示

### 基础表格

```playground
basic
```

### 带汇总行

```playground
with-footer
```

### 行选中态

```playground
selected-row
```

## 属性说明 (API)

### Table

<DataTable preset="props" :data="[
  { name: 'containerClassName', type: 'string', default: '-', description: '外层滚动容器样式扩展。' },
  { name: 'containerRef', type: 'React.Ref<HTMLDivElement>', default: '-', description: '外层滚动容器引用。' },
  { name: 'className', type: 'string', default: '-', description: 'table 元素样式扩展。' },
  { name: '...props', type: 'React.ComponentProps<"table">', default: '-', description: '透传原生 table 属性。' }
]"/>

### 子组件

<DataTable preset="props" :data="[
  { name: 'TableHeader / TableBody / TableFooter', type: 'thead / tbody / tfoot props', default: '-', description: '表格结构区域组件。' },
  { name: 'TableRow', type: 'React.ComponentProps<"tr">', default: '-', description: '行容器；支持 `data-state="selected"` 选中态。' },
  { name: 'TableHead', type: 'React.ComponentProps<"th">', default: '-', description: '表头单元格。' },
  { name: 'TableCell', type: 'React.ComponentProps<"td">', default: '-', description: '数据单元格。' },
  { name: 'TableCaption', type: 'React.ComponentProps<"caption">', default: '-', description: '表格标题说明。' }
]"/>

## A11y

- 使用语义化 `thead/tbody/th/td`，有利于读屏识别。
- 对可点击行建议同时支持键盘聚焦和 Enter 操作。
- 横向滚动表格应保留关键列可见，避免信息丢失。

## 常见问题 (FAQ)

### 为什么 `Table` 外层会自动有横向滚动？

组件默认包裹 `overflow-x-auto` 容器，避免窄屏时内容被截断。

### 如何做行选中样式？

给 `TableRow` 设置 `data-state="selected"`，即可使用内置选中态样式。
