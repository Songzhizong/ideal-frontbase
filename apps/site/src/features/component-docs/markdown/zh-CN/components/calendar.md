用于日期可视化选择，基于 `react-day-picker` 封装并统一了站点视觉风格。

源码位置：`packages/ui/calendar.tsx`

## 何时使用

`Calendar` 适合直接在页面中展示日期面板。

- 单日期选择（预约、排期）
- 日期区间选择（统计时间窗口）
- 多月联动浏览（日历面板）

不建议使用场景：

- 仅需输入框式日期选择（建议使用 `DatePicker`）

## 代码演示

### 单日期选择

```playground
single
```

### 日期区间选择

```playground
range
```

### 双月与下拉标题

```playground
multiple-months
```

## 属性说明 (API)

### Calendar

<DataTable preset="props" :data="[
  { name: 'mode', type: 'single | multiple | range', default: '-', description: '选择模式（继承 DayPicker）。' },
  { name: 'selected', type: 'Date | Date[] | DateRange', default: '-', description: '受控已选值。' },
  { name: 'onSelect', type: '(value) => void', default: '-', description: '选择变化回调。' },
  { name: 'numberOfMonths', type: 'number', default: '1', description: '显示月份数量。' },
  { name: 'captionLayout', type: 'label | dropdown', default: 'label', description: '标题区域展示方式。' },
  { name: 'showOutsideDays', type: 'boolean', default: 'true', description: '是否显示当前月之外的日期。' },
  { name: 'buttonVariant', type: 'Button variant', default: 'ghost', description: '切换月份按钮的视觉变体。' },
  { name: 'className / classNames', type: 'string / DayPicker classNames', default: '-', description: '样式扩展。' }
]"/>

### CalendarDayButton

<DataTable preset="props" :data="[
  { name: 'day', type: 'CalendarDay', default: '-', description: '当前日期单元数据。' },
  { name: 'modifiers', type: 'DayModifiers', default: '-', description: '选中、范围、焦点等状态集合。' },
  { name: 'className', type: 'string', default: '-', description: '日期按钮样式扩展。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'CalendarProps', value: 'React.ComponentProps<typeof DayPicker> & { buttonVariant?: Button["variant"] }' },
  { name: 'DateRange', value: 'react-day-picker 中的范围类型' },
  { name: 'CalendarDayButtonProps', value: 'React.ComponentProps<typeof DayButton>' }
]"/>

## A11y

- 内置键盘导航与焦点管理，支持方向键切换日期。
- 建议为日历区域提供上下文标题（如“选择统计区间”）。
- 区间选择时请在旁边同步显示已选起止日期，减少误解。

## 常见问题 (FAQ)

### 如何切换为区间选择？

把 `mode` 设为 `range`，并使用 `DateRange` 结构管理 `selected`。

### 如何显示两个月并支持月份下拉？

设置 `numberOfMonths={2}` 与 `captionLayout="dropdown"`。
