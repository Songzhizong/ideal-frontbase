用于展示单个关键数值，支持趋势、格式化、加载骨架和空值占位。

源码位置：`packages/ui/statistic.tsx`

## 何时使用

`Statistic` 适合在页面局部展示单项指标。

- 实时指标卡片内的核心数值
- 表单或详情页中的统计摘要
- 趋势对比中的关键数字

不建议使用场景：

- 需要多维对比和交互分析（建议用图表）

## 代码演示

### 基础统计

```playground
basic
```

### 前后缀与精度

```playground
prefix-suffix
```

### 自定义格式化

```playground
formatter
```

### 加载态

```playground
loading
```

## 属性说明 (API)

### Statistic

<DataTable preset="props" :data="[
  { name: 'value', type: 'number | string | null | undefined', default: '-', description: '指标值，必填。' },
  { name: 'label', type: 'ReactNode', default: '-', description: '指标标题。' },
  { name: 'prefix / suffix', type: 'ReactNode', default: '-', description: '值前后缀。' },
  { name: 'trend', type: 'up | down | neutral', default: 'neutral', description: '趋势方向。' },
  { name: 'trendValue', type: 'ReactNode', default: '-', description: '趋势描述文本。' },
  { name: 'icon', type: 'ReactNode', default: '-', description: '右上角图标。' },
  { name: 'loading', type: 'boolean', default: 'false', description: '加载态。' },
  { name: 'formatter', type: '(value) => ReactNode', default: '-', description: '自定义格式化函数。' },
  { name: 'precision', type: 'number', default: '-', description: '数值小数位。' },
  { name: 'locale / formatOptions', type: 'Intl.NumberFormat options', default: '-', description: '原生数字格式化选项。' },
  { name: 'empty', type: 'ReactNode', default: '--', description: '空值占位内容。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'StatisticTrend', value: 'up | down | neutral' },
  { name: 'StatisticProps', value: 'value + label/prefix/suffix + trend + formatter/loading 等字段' }
]"/>

## A11y

- 指标应搭配明确标签，避免“纯数字无语境”。
- 趋势应同时提供文案，不只依赖颜色。
- 加载状态建议保留稳定高度，减少布局抖动。

## 常见问题 (FAQ)

### 如何把小数转百分比展示？

通过 `formatter` 自定义输出，例如 `value * 100 + "%"`。

### `precision` 和 `formatter` 同时使用时谁生效？

`formatter` 优先级更高，传入后由你完全控制显示内容。
