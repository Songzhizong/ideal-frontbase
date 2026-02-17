# SuperDateRangePicker 使用说明

> 面向组件使用方的落地文档。读完后你可以直接在业务中接入，并正确设计 `quickPresets`（预置快速选择）。

## 1. 组件定位

`SuperDateRangePicker` 用于输出“可解析、可持久化、可回显”的时间范围定义：

- 输入输出核心是 `TimeRangeDefinition`，而不是 `Date`。
- 解析结果统一是半开区间 `[start, end)`。
- 组件会通过 `onResolvedChange` 输出结构化结果（含 `startMs/endMs/startIso/endIso`）。

推荐导入方式：

```tsx
import { SuperDateRangePicker, type QuickPresetItem } from "@/packages/ui"
```

## 2. 最小可用示例

```tsx
import { useState } from "react"
import {
  SuperDateRangePicker,
  type QuickPresetItem,
  type TimeRangeDefinition,
  type TimeZoneMode,
} from "@/packages/ui"

const QUICK_PRESETS: QuickPresetItem[] = [
  {
    key: "last-15m",
    label: "最近 15 分钟",
    group: "最近",
    keywords: ["15m", "15分钟"],
    definition: {
      from: { expr: "now-15m" },
      to: { expr: "now" },
      label: "最近 15 分钟",
      ui: { editorMode: "relative" },
    },
  },
  {
    key: "today",
    label: "今天",
    group: "常用",
    keywords: ["today"],
    definition: {
      from: { expr: "now/d" },
      to: { expr: "now/d", round: "up" },
      label: "今天",
      ui: { editorMode: "relative", rangeTokenMode: "two_endpoints" },
    },
  },
]

export function Example() {
  const [value, setValue] = useState<TimeRangeDefinition | null>(null)
  const [timezone, setTimezone] = useState<TimeZoneMode>({ kind: "browser" })

  return (
    <SuperDateRangePicker
      quickPresets={QUICK_PRESETS}
      value={value}
      timezone={timezone}
      onTimezoneChange={setTimezone}
      onResolvedChange={(payload, meta) => {
        // 受控模式建议：始终用 payload.definition 回写 value
        setValue(payload?.definition ?? null)
        // 也可在此同步查询参数
        console.log(meta.reason, payload?.resolved)
      }}
    />
  )
}
```

## 3. `quickPresets` 设计规范（重点）

### 3.1 数据结构

```ts
type QuickPresetItem = {
  key: string
  label: string
  group: string
  keywords?: string[]
  definition: TimeRangeDefinition
}
```

### 3.2 必须遵守的规则

1. `key` 必须全局唯一且稳定。
1. `group` 决定分组与展示顺序：按数组出现顺序渲染。
1. `keywords` 建议同时包含中文和短写（如 `15m`、`近15分钟`），便于搜索。
1. `definition` 必须在运行时可解析，且满足 `start < end`。
1. 区间语义是 `[start, end)`，设计业务语义时不要按闭区间理解。

### 3.3 表达式选择建议

- 相对区间优先用 DateMath：`now-15m`、`now-1h/h`、`now/d`。
- 绝对时刻可用 ISO（必须带 `Z` 或 `±HH:mm`）或 `@wall:YYYY-MM-DD HH:mm:ss`。
- 不支持自然语言短语，如 `yesterday`。

### 3.4 `round` 正确用法

`round` 只应在“可推导单位”的表达式上使用。

推荐：

```ts
{ expr: "now/d", round: "up" } // 有 /d，可推导
{ expr: "now-1h", round: "up" } // 最后一个 add 节点是 h，可推导
```

错误示例（会报 `ENDPOINT_ROUND_UNIT_REQUIRED`）：

```ts
{ expr: "@wall:2026-02-13 10:00:00", round: "up" }
{ expr: "2026-02-13T10:00:00+08:00", round: "up" }
```

### 3.5 常用预置模板（可直接抄）

```ts
export const RECOMMENDED_PRESETS: QuickPresetItem[] = [
  {
    key: "last-15m",
    label: "最近 15 分钟",
    group: "最近",
    keywords: ["15m", "15分钟"],
    definition: {
      from: { expr: "now-15m" },
      to: { expr: "now" },
      label: "最近 15 分钟",
      ui: { editorMode: "relative" },
    },
  },
  {
    key: "last-1h",
    label: "最近 1 小时",
    group: "最近",
    keywords: ["1h", "1小时"],
    definition: {
      from: { expr: "now-1h" },
      to: { expr: "now" },
      label: "最近 1 小时",
      ui: { editorMode: "relative" },
    },
  },
  {
    key: "today",
    label: "今天",
    group: "常用",
    keywords: ["today", "今天"],
    definition: {
      from: { expr: "now/d" },
      to: { expr: "now/d", round: "up" },
      label: "今天",
      ui: { editorMode: "relative", rangeTokenMode: "two_endpoints" },
    },
  },
  {
    key: "yesterday",
    label: "昨天",
    group: "常用",
    keywords: ["yesterday", "昨天"],
    definition: {
      from: { expr: "now-1d/d" },
      to: { expr: "now-1d/d", round: "up" },
      label: "昨天",
      ui: { editorMode: "relative", rangeTokenMode: "two_endpoints" },
    },
  },
  {
    key: "this-month",
    label: "本月",
    group: "取整",
    keywords: ["month", "本月"],
    definition: {
      from: { expr: "now/M" },
      to: { expr: "now/M", round: "up" },
      label: "本月",
      ui: { editorMode: "relative", rangeTokenMode: "two_endpoints" },
    },
  },
]
```

### 3.6 预置项上线前校验（强烈建议）

在业务侧增加一次开发期校验，提前发现无效预置：

```ts
import {
  createDefaultTimeEngine,
  resolveRange,
  type QuickPresetItem,
  type TimeZoneMode,
} from "@/packages/ui"

export function validateQuickPresets(presets: QuickPresetItem[]) {
  const engine = createDefaultTimeEngine()
  const sampleNowList = [
    Date.UTC(2026, 1, 14, 12, 0, 0),
    Date.UTC(2026, 2, 8, 10, 0, 0),
    Date.UTC(2026, 10, 1, 8, 0, 0),
  ]
  const sampleTzList: TimeZoneMode[] = [
    { kind: "utc" },
    { kind: "browser" },
    { kind: "iana", tz: "America/Los_Angeles" },
  ]

  for (const preset of presets) {
    for (const nowMs of sampleNowList) {
      for (const timezone of sampleTzList) {
        resolveRange(preset.definition, {
          nowMs,
          timezone,
          weekStartsOn: 1,
          engine,
        })
      }
    }
  }
}
```

> 建议在测试或开发启动时调用。抛错即代表该 preset 在某些时间/时区下无效。

## 4. 关键 API 使用建议

### 4.1 受控 vs 非受控

- 非受控：传 `defaultValue`/`defaultTimezone` 即可。
- 受控：传 `value`/`timezone`，并在 `onResolvedChange` / `onTimezoneChange` 中同步回写。

建议：受控模式下，总是优先回写 `payload?.definition`，不要自己重拼表达式。

### 4.2 `quickSelectBehavior`

- `commit`（默认）：点击预置立即提交并关闭面板。
- `draft`：仅把预置写入草稿，不立即提交。

如果 `commit` 预置解析失败，组件会留在当前面板并显示错误，不会崩溃。

### 4.3 错误与 warning

- 输入错误：显示在输入框下方或 Footer 错误区。
- 解析 warning（DST gap/overlap）：显示在 Footer warning 区。

业务建议：将 `payload.resolved.warnings` 上报日志，便于排查时区边界问题。

## 5. 开发自测清单

1. `quickPresets` 是否全部可解析，且都满足 `start < end`。
1. `group` 顺序是否符合产品预期。
1. 快搜关键字是否覆盖常见输入（中英文/短写）。
1. 切换时区后关键预置（今天、昨天、本月）是否符合预期。
1. DST 场景（如美西 3 月/11 月）是否有正确 warning。

## 6. 常见问题

### Q1：为什么“今天”要写成 `now/d` 到 `now/d + round: up`？

因为组件是半开区间 `[start, end)`。`today` 应该是当天 00:00 到次日 00:00，最稳妥写法就是：

- `from: { expr: "now/d" }`
- `to: { expr: "now/d", round: "up" }`

### Q2：可以给 ISO 或 `@wall` 配 `round` 吗？

不建议。多数情况下会因为无法推导单位而报错。优先使用 DateMath 做取整。

### Q3：预置 label 什么时候会显示在 Trigger 上？

当 `definition.label` 存在且 `from/to` 都是 DateMath 时，Trigger 优先显示 label。
