用于在卡片容器中展示核心统计指标，内置趋势、格式化与加载态。

源码位置：`packages/ui/stat-card.tsx`

## 何时使用

`StatCard` 适合仪表盘首页和运营面板中的关键指标展示。

- 核心业务指标卡片（PV、UV、成功率）
- 带趋势对比的周期统计
- 需要附带说明、操作入口的指标模块

不建议使用场景：

- 多维明细对比（建议用图表或表格）

## 代码演示

### 基础统计卡

```playground
basic
```

### 带操作区与页脚

```playground
with-action-footer
```

### 加载态

```playground
loading
```

## 属性说明 (API)

### StatCard

<DataTable preset="props" :data="[
  { name: 'value', type: 'number | string | null | undefined', default: '-', description: '指标值，必填。' },
  { name: 'label', type: 'ReactNode', default: '-', description: '指标标签。' },
  { name: 'prefix / suffix', type: 'ReactNode', default: '-', description: '数值前后缀。' },
  { name: 'trend', type: 'up | down | neutral', default: 'neutral', description: '趋势方向。' },
  { name: 'trendValue', type: 'ReactNode', default: '-', description: '趋势文案。' },
  { name: 'description', type: 'ReactNode', default: '-', description: '卡片描述信息。' },
  { name: 'action', type: 'ReactNode', default: '-', description: '头部操作区内容。' },
  { name: 'footer', type: 'ReactNode', default: '-', description: '底部扩展内容。' },
  { name: 'loading', type: 'boolean', default: 'false', description: '加载态。' },
  { name: 'formatter / precision / locale / formatOptions', type: '同 Statistic', default: '-', description: '数值格式化配置。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'StatCardProps', value: 'Card props + Statistic 核心字段 + description/action/footer' },
  { name: 'BaseStatisticProps', value: '从 StatisticProps 选取 value/label/trend/loading/formatter 等字段' }
]"/>

## A11y

- 指标标签要清晰，避免只显示数字。
- 趋势文案建议包含周期（如“较昨日 +8%”）。
- 加载态结束后应避免布局跳动，保证可读性。

## 常见问题 (FAQ)

### `StatCard` 和 `Statistic` 的关系是什么？

`StatCard` 内部组合了 `Card + Statistic`，适合卡片化场景；`Statistic` 更适合裸指标模块。

### 如何在卡片右上角放按钮？

使用 `action` 属性传入按钮或菜单组件。
