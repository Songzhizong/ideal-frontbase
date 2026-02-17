用于基于 Recharts 快速构建主题一致的图表容器、Tooltip 与 Legend。

源码位置：`packages/ui/chart.tsx`

## 何时使用

`Chart` 组件族适合在 Recharts 基础上统一图表样式与语义配置。

- 业务看板中的柱状/折线/饼图
- 需要自定义 tooltip/legend 展示
- 需要通过配置统一管理系列名称与颜色

不建议使用场景：

- 非 Recharts 技术栈图表（该组件仅封装 Recharts）

## 代码演示

### 柱状图基础

```playground
bar-basic
```

### 折线图 Tooltip

```playground
line-with-tooltip
```

### 饼图 Legend

```playground
pie-with-legend
```

## 属性说明 (API)

### ChartContainer

<DataTable preset="props" :data="[
  { name: 'config', type: 'ChartConfig', default: '-', description: '图表字段配置（label/icon/color/theme），必填。' },
  { name: 'children', type: 'ResponsiveContainer children', default: '-', description: 'Recharts 图表内容。' },
  { name: 'id', type: 'string', default: '自动生成', description: '图表实例标识，用于作用域样式变量。' },
  { name: 'className', type: 'string', default: '-', description: '图表容器样式扩展。' }
]"/>

### ChartTooltipContent

<DataTable preset="props" :data="[
  { name: 'indicator', type: 'dot | line | dashed', default: 'dot', description: 'tooltip 指示器样式。' },
  { name: 'hideLabel', type: 'boolean', default: 'false', description: '是否隐藏标题。' },
  { name: 'hideIndicator', type: 'boolean', default: 'false', description: '是否隐藏颜色指示器。' },
  { name: 'nameKey / labelKey', type: 'string', default: '-', description: '自定义系列名映射键。' },
  { name: 'formatter / labelFormatter', type: 'formatter callbacks', default: '-', description: '自定义格式化输出。' }
]"/>

### ChartLegendContent

<DataTable preset="props" :data="[
  { name: 'hideIcon', type: 'boolean', default: 'false', description: '是否隐藏图例图标。' },
  { name: 'verticalAlign', type: 'top | bottom', default: 'bottom', description: '图例位置。' },
  { name: 'nameKey', type: 'string', default: '-', description: '图例名称映射键。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'ChartConfig', value: 'Record<string, { label?; icon?; color? | theme? }>' },
  { name: 'ChartTooltip', value: 'Recharts Tooltip 透传组件' },
  { name: 'ChartLegend', value: 'Recharts Legend 透传组件' }
]"/>

## A11y

- 图表旁建议提供关键数值文本摘要，避免仅靠图形表达。
- Tooltip 文案应语义明确，尽量包含单位。
- 颜色编码之外建议增加图例/标签，减少色弱用户理解成本。

## 常见问题 (FAQ)

### 为什么系列颜色建议使用 `var(--color-xxx)`？

`ChartContainer` 会基于 `config` 注入 CSS 变量，使用变量可自动适配主题。

### 如何在 tooltip 中显示自定义格式？

通过 `ChartTooltipContent` 的 `formatter` 和 `labelFormatter` 处理显示逻辑。
