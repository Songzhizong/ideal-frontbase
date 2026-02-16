用于输入框形态的日期选择，基于 `react-aria-components` 构建，支持单日期与日期区间。

源码位置：`packages/ui/date-picker-rac.tsx`

## 何时使用

`DatePicker` / `DateRangePicker` 适合表单中的日期输入与筛选条件。

- 表单日期字段（开始日期、截止日期）
- 报表筛选时间范围
- 需要键盘分段输入与弹层日历联动的场景

不建议使用场景：

- 页面内常驻大日历面板（建议使用 `Calendar`）

## 代码演示

### 单日期选择

```playground
basic
```

### 日期区间选择

```playground
range
```

### 内联日历模式

```playground
inline
```

## 属性说明 (API)

### DatePicker

<DataTable preset="props" :data="[
  { name: 'value', type: 'Date', default: '-', description: '受控日期值。' },
  { name: 'onChange', type: '(date: Date | undefined) => void', default: '-', description: '日期变化回调。' },
  { name: 'className', type: 'string', default: '-', description: '组件容器样式扩展。' },
  { name: 'triggerClassName', type: 'string', default: '-', description: '触发输入框样式扩展。' },
  { name: 'autoOpen', type: 'boolean', default: 'false', description: '是否自动打开弹层。' },
  { name: 'autoFocusInput', type: 'boolean', default: 'false', description: '是否自动聚焦输入分段。' },
  { name: 'inlineCalendar', type: 'boolean', default: 'false', description: '是否以内联方式展示日历（不使用弹层）。' }
]"/>

### DateRangePicker

<DataTable preset="props" :data="[
  { name: 'value', type: '{ from: Date; to?: Date }', default: '-', description: '受控日期区间。' },
  { name: 'onChange', type: '(range: { from: Date; to?: Date } | undefined) => void', default: '-', description: '区间变化回调。' },
  { name: 'className', type: 'string', default: '-', description: '组件容器样式扩展。' },
  { name: 'triggerClassName', type: 'string', default: '-', description: '触发输入框样式扩展。' },
  { name: 'autoOpen', type: 'boolean', default: 'false', description: '是否自动打开弹层。' },
  { name: 'autoFocusInput', type: 'boolean', default: 'false', description: '是否自动聚焦输入分段。' },
  { name: 'inlineCalendar', type: 'boolean', default: 'false', description: '是否以内联方式展示范围日历。' }
]"/>

## 使用建议

- 表单提交前请将 `Date` 统一序列化为后端约定格式（ISO 或时间戳）。
- 区间筛选建议默认给出常用范围，减少用户手动输入成本。
- 如需受控弹层开关，可通过 `autoOpen` 结合外部状态管理。

## A11y

- 组件使用分段输入（`DateSegment`），支持键盘逐段调整。
- 请为日期字段提供可见标签或外层 `aria-label`。
- 在区间选择中建议同步显示可读文案（起止日期），降低理解成本。

## 常见问题 (FAQ)

### 如何清空已选日期区间？

在受控模式下将 `value` 设为 `undefined` 即可。

### 如何做“页面内固定日历”而不是弹层？

将 `inlineCalendar` 设为 `true`。
