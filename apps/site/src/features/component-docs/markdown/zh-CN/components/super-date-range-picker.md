用于表达式驱动的高级时间范围选择，支持相对时间、绝对时间、快捷预设与时区解析。

源码位置：`packages/ui/super-date-range-picker.tsx`

## 何时使用

`SuperDateRangePicker` 适合监控、日志、分析等对时间语义要求高的场景。

- 监控大盘时间窗口筛选（如最近 15 分钟）
- 日志检索中需要快捷预设 + 手工编辑
- 多时区团队协作下的统一时间范围表达

不建议使用场景：

- 仅需简单日期输入（建议使用 `DatePicker` / `DateRangePicker`）

## 代码演示

### 基础快捷预设

```playground
basic
```

### 受控值与解析结果

```playground
controlled
```

### 时区切换

```playground
timezone
```

## 属性说明 (API)

### SuperDateRangePicker

<DataTable preset="props" :data="[
  { name: 'quickPresets', type: 'QuickPresetItem[]', default: '-', description: '快捷预设列表，必填。' },
  { name: 'value / defaultValue', type: 'TimeRangeDefinition | null', default: '-', description: '受控/非受控时间定义。' },
  { name: 'onResolvedChange', type: '(payload, meta) => void', default: '-', description: '解析后结果回调（含 UTC 时间戳、ISO 与元信息）。' },
  { name: 'timezone / defaultTimezone', type: 'TimeZoneMode', default: 'browser', description: '当前时区（受控/非受控）。' },
  { name: 'onTimezoneChange', type: '(tz: TimeZoneMode) => void', default: '-', description: '时区变化回调。' },
  { name: 'timezoneOptions', type: 'TimeZoneMode[]', default: '[browser, utc]', description: '时区下拉可选项。' },
  { name: 'allowEmpty', type: 'boolean', default: 'false', description: '是否允许空值。' },
  { name: 'clearable', type: 'boolean', default: 'false', description: '是否允许清空选择。' },
  { name: 'placeholder', type: 'string', default: '-', description: '触发器占位文案。' },
  { name: 'manualEditorMode', type: 'datetime | date', default: '-', description: '手工编辑器模式。' },
  { name: 'quickSelectBehavior', type: 'commit | draft', default: 'commit', description: '快捷预设选择后是否立即提交。' }
]"/>

## 类型

<DataTable preset="types" :data="[
  { name: 'SuperDateRangePickerProps', value: 'value/defaultValue + timezone + quickPresets + resolve callbacks' },
  { name: 'TimeRangeDefinition', value: '{ from: EndpointDef; to: EndpointDef; label?; ui? }' },
  { name: 'QuickPresetItem', value: '{ key; label; group; keywords?; definition }' },
  { name: 'TimeZoneMode', value: '{ kind: "utc" } | { kind: "browser" } | { kind: "iana"; tz: string }' },
  { name: 'ResolvedPayload', value: '包含 startMs/endMs/startIso/endIso/timezone 等解析结果' }
]"/>

## A11y

- 快捷预设分组名称要可读，避免仅用缩写。
- 时区切换后建议在页面显式提示当前时区，防止时间误读。
- 对“可清空”行为建议配合文案提示，避免用户误清空后无感知。

## 常见问题 (FAQ)

### 如何定义“最近 15 分钟”预设？

使用表达式定义：`from: now-15m`，`to: now`。

### 如何拿到后端可直接使用的时间区间？

通过 `onResolvedChange` 获取 `payload.resolved.startMs/endMs` 或 ISO 字符串。
