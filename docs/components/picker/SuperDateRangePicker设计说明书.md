# SuperDateRangePicker 设计说明书

> 本文描述 `packages/ui/super-date-range-picker` 的能力边界、类型约定、解析规则、交互与测试基线。内容以当前代码实现为准，可直接用于联调与验收。

## 0. 设计目标与硬约束

### 0.1 时间语义分层

组件内时间分为四层：

1. Definition（意图层）：`TimeRangeDefinition`，用于持久化与回显。
2. IR（运算层）：DateMath AST 与日历字段运算。
3. Zoned（展示层）：选定时区下的墙上时间（年月日时分秒）。
4. Instant（查询层）：`startMs/endMs` 与 ISO 字符串。

约束：业务逻辑不把 JS `Date` 当作带时区的墙上时间对象使用。

### 0.2 区间语义

统一使用半开区间：`[start, end)`。

- `start`：包含
- `end`：不包含

### 0.3 一次解析只使用一个 now 锚点

每次 `resolveRange` 调用使用同一个 `nowMs`。

- 同一轮解析内不重复取当前时间。
- `from` 与 `to` 在同一 `nowMs` 下求值。

## 1. 能力边界

### 1.1 已支持能力

- DateMath：`now`、链式加减、`/unit` 取整。
- ISO 绝对时间：仅接受带 `Z` 或 `±HH:mm` 偏移。
- Wall Time：`@wall:YYYY-MM-DD HH:mm:ss`，以及输入期自动归一化。
- 快捷范围：由使用方通过 `quickPresets` 定义分组与内容。
- 时区模式：`UTC`、`Browser`（UI 可选）；`IANA`（API 可传入并可参与解析）。
- 受控/非受控：`value/defaultValue`、`timezone/defaultTimezone`。
- 空态清除：`allowEmpty` + `clearable`。
- 手动编辑模式：`datetime` / `date`。
- DST gap/overlap 处理与 warnings 透出。
- 外部传入非法 definition 时安全降级（清空 live snapshot + 显示错误），不抛出未处理渲染异常。

### 1.2 当前不包含

- 时区配置管理能力（例如远程拉取时区配置、按租户下发）。
- 自然语言时间短语（例如 `yesterday`）。
- 组件内最近使用持久化。

## 2. 数据模型与公共类型

### 2.1 核心类型

```typescript
export type TimeZoneMode =
  | { kind: "utc" }
  | { kind: "browser" }
  | { kind: "iana"; tz: string }

export type Disambiguation = "earlier" | "later"
export type GapPolicy = "next_valid" | "error"
export type EndpointRound = "down" | "up" | "none"

export type EndpointDef = {
  expr: string
  round?: EndpointRound
  disambiguation?: Disambiguation
  gapPolicy?: GapPolicy
}

export type TimeRangeDefinition = {
  from: EndpointDef
  to: EndpointDef
  label?: string
  ui?: {
    editorMode?: "relative" | "absolute" | "mixed"
    rangeTokenMode?: "two_endpoints" | "single_endpoint"
    manualEditorMode?: "datetime" | "date"
  }
}

export type QuickPresetItem = {
  key: string
  label: string
  group: string
  keywords?: string[]
  definition: TimeRangeDefinition
}

export type EngineCaps = {
  supportsDisambiguation: boolean
  supportsGapResolution: boolean
  supportsIanaTimeZones: boolean
}

export type ResolveWarning = {
  code: string
  message: string
}

export type ResolvedTimeRange = {
  startMs: number
  endMs: number
  startIso: string
  endIso: string
  nowMs: number
  timezone: TimeZoneMode
  resolvedTz: string
  engineCaps: EngineCaps
  warnings?: ResolveWarning[]
}

export type ResolvedPayload = {
  definition: TimeRangeDefinition
  resolved: ResolvedTimeRange
}

export type ChangeReason =
  | "apply"
  | "quick_select"
  | "timezone_change"
  | "external_sync"
  | "clear"

export type ResolvedChangeMeta = {
  reason: ChangeReason
  timezone: TimeZoneMode
}
```

### 2.2 Draft 状态类型

```typescript
export type DraftSource =
  | "typing"
  | "calendar"
  | "scroller"
  | "blur"
  | "preset"
  | "external_reset"

export type DraftEndpointParse =
  | { kind: "empty" }
  | { kind: "error"; message: string }
  | { kind: "ok"; expr: string; kindHint: "datemath" | "iso" | "wall" }

export type DraftEndpointState = {
  rawText: string
  parse: DraftEndpointParse
  parts?: {
    calendarDate: { y: number; m: number; d: number }
    timeParts: { hh: number; mm: number; ss: number }
  }
  disambiguation?: Disambiguation
  gapPolicy?: GapPolicy
  round?: EndpointRound
  dirty: boolean
  source: DraftSource
}

export type DraftState = {
  from: DraftEndpointState
  to: DraftEndpointState
  isDirty: boolean
  lastFocused: "from" | "to"
}
```

## 3. 表达式规则

### 3.1 支持格式

- DateMath：`now-15m`、`now-1h/h`。
- ISO：`2026-02-13T10:00:00Z`、`2026-02-13T10:00:00+08:00`。
- Wall Time：`@wall:2026-02-13 10:00:00`。
- 用户输入的 `YYYY-MM-DD HH:mm` / `YYYY-MM-DD HH:mm:ss` 会归一化为 `@wall:`。
- 用户输入 `YYYY-MM-DD` 也会归一化为 `@wall:YYYY-MM-DD 00:00:00`。

### 3.2 DateMath 语法

```text
now(?:[+-]\d+[smhdwMy])*(?:/[smhdwMy])?
```

- 链式加减从左到右执行。
- `/unit` 代表 round-down。
- 单位：`s m h d w M y`。

### 3.3 非法输入规则

- 空字符串：解析为 `empty`。
- 不支持词典短语：如 `yesterday`。
- ISO 无时区偏移（如 `2026-02-13T10:00:00`）判定为非法。

## 4. Resolve 规则

### 4.1 入口

```typescript
function resolveRange(definition: TimeRangeDefinition, options: ResolveOptions): ResolvedTimeRange
```

`ResolveOptions` 包含：`nowMs`、`timezone`、`weekStartsOn`、`engine`。

### 4.2 执行流程

1. 解析时区：`engine.resolveTimezone(timezone)`。
2. 解析 `from.expr` 与 `to.expr`。
3. 在 wall-time 层执行 DateMath 与 endpoint rounding。
4. 通过 `engine.zonedPartsToInstant` 转为毫秒时间戳。
5. 校验 `startMs < endMs`，否则抛出 `START_NOT_BEFORE_END`。
6. 汇总 `warnings`（去重）并输出 `ResolvedTimeRange`。

### 4.3 Endpoint rounding 规则

- `round="none"`：不额外处理。
- 表达式已含 `/unit`：
  - `round="down"`：不重复 round。
  - `round="up"`：在当前结果上加 `1 * unit`。
- 表达式不含 `/unit`：
  - 仅 DateMath 可通过最后一个加减节点推断 unit。
  - 无法推断时抛出 `ENDPOINT_ROUND_UNIT_REQUIRED`。

说明：ISO 与 wall 表达式通常不可推断 unit，若设置 `round` 会触发错误。

## 5. TimeEngine 与 DST

### 5.1 引擎选择

- 默认：`createDefaultTimeEngine()`。
- 优先使用 Temporal 引擎；不可用时自动回退到 fallback 引擎。

### 5.2 能力标记

- Temporal：
  - `supportsDisambiguation=true`
  - `supportsGapResolution=true`
  - `supportsIanaTimeZones=true`
- Fallback：
  - `supportsDisambiguation=false`
  - `supportsGapResolution=true`
  - `supportsIanaTimeZones=true`

### 5.3 DST gap / overlap

- gap（不存在的本地时间）：
  - `gapPolicy="next_valid"`：顺延并给出 `DST_GAP_SHIFTED`。
  - `gapPolicy="error"`：抛出 `DST_GAP_ERROR`。
- overlap（重复本地时间）：
  - Temporal 支持 `earlier/later`。
  - 未传 disambiguation 时默认 earlier，并给出 `DST_OVERLAP_DEFAULT_EARLIER`。
  - Fallback 在请求 later 时仍强制 earlier，并给出 `DST_OVERLAP_FORCED_EARLIER`。

## 6. 组件 API 契约

```typescript
export type SuperDateRangePickerProps = {
  value?: TimeRangeDefinition | null
  defaultValue?: TimeRangeDefinition | null

  timezone?: TimeZoneMode
  defaultTimezone?: TimeZoneMode
  onTimezoneChange?: (tz: TimeZoneMode) => void

  onResolvedChange?: (payload: ResolvedPayload | null, meta: ResolvedChangeMeta) => void

  nowProvider?: () => number
  weekStartsOn?: 0 | 1 | 6
  locale?: string

  allowEmpty?: boolean
  clearable?: boolean
  placeholder?: string
  manualEditorMode?: "datetime" | "date"

  quickPresets: QuickPresetItem[]
  quickSearchPlaceholder?: string
  quickEmptyText?: string

  quickSelectBehavior?: "commit" | "draft"
  timezoneOptions?: TimeZoneMode[]
  behavior?: { whileEditing: "freeze_trigger_ui" | "normal" }
  timeEngine?: TimeEngine
}
```

### 6.1 默认值

- `allowEmpty=false`
- `clearable=true`
- `placeholder="请选择时间"`
- `weekStartsOn=1`
- `quickSearchPlaceholder="搜索快捷选项"`
- `quickEmptyText="暂无匹配的快捷项"`
- `quickSelectBehavior="commit"`
- `timezoneOptions=[{kind:"utc"},{kind:"browser"}]`（若当前时区不在列表中会自动补入）
- `behavior.whileEditing="freeze_trigger_ui"`
- 初始区间（非空场景）：最近 15 分钟

### 6.2 事件触发规则

1. Apply：
   - 触发 `onResolvedChange(payload, { reason: "apply", timezone })`
2. Quick preset（commit 模式）：
   - 触发 `onResolvedChange(payload, { reason: "quick_select", timezone })`
3. 时区切换：
   - 始终触发 `onTimezoneChange(nextTimezone)`
   - 触发 `onResolvedChange(payloadOrNull, { reason: "timezone_change", timezone: nextTimezone })`
4. 外部 value/timezone 同步（存在 definition）：
   - 触发 `onResolvedChange(payload, { reason: "external_sync", timezone })`
   - 若与组件最近一次内部提交结果（definition + timezone）完全一致，仅做内部状态对齐，不重复触发 `external_sync` 事件。
5. 外部同步到空值（definition 为 `null`）：
   - Live snapshot 清空
   - 触发 `onResolvedChange(null, { reason: "external_sync", timezone })`
6. 清除动作：
   - 仅在 `allowEmpty=true` 时生效
   - 触发 `onResolvedChange(null, { reason: "clear", timezone })`

## 7. 内部状态模型

### 7.1 三份状态

- `committedDefinition`：已生效区间。
- `draft`：面板内编辑态，允许临时无效输入。
- `liveStore(snapshot)`：触发器与对外事件使用的已解析快照。

### 7.2 冻结展示策略

`behavior.whileEditing="freeze_trigger_ui"` 时：

- 打开 Popover 后记录一份 `frozenSnapshot`。
- 编辑期间 Trigger 保持冻结显示。
- 关闭后恢复实时快照。

### 7.3 Draft 同步规则

- typing：仅写 `rawText`，保留输入原样。
- blur：若 parse 成功，文本归一化（例如秒补齐、`@wall:` 去前缀展示）。
- calendar/scroller：直接生成 wall 表达式并写入 `parts`。
- preset：整体替换 draft 两端。

### 7.4 外部更新冲突处理

当 Popover 已打开且 `draft.isDirty=true`：

- 外部 `value` 到来时不覆盖当前草稿。
- Footer 展示“时间范围已被外部更新”提示与“重置”入口。

## 8. UI 与交互

### 8.1 Trigger

- 整体为一个 button，点击后打开 Popover。
- 摘要优先级：
  1. 有 selection 且 `definition.label` 存在，且 from/to 都是 DateMath：显示 label。
  2. `ui.manualEditorMode="date"`：显示日期范围。
  3. 其他：显示日期时间范围。
- 为空时显示占位文案。
- 仅在 `allowEmpty && clearable && hasSelection` 时显示清除图标。
- 清除图标点击不会打开 Popover。
- Trigger 聚焦时按 `Backspace/Delete` 也可清除。

### 8.2 Popover 布局

- 宽度：`min(96vw, 600px)`。
- 栅格：移动端单列；`md` 以上 `400px + 200px` 双列。
- 左侧 `ManualPanel`，右侧 `QuickPanel`，底部 `PickerFooter`。

### 8.3 ManualPanel

- 编辑模式切换：`日期时间` / `仅日期`。
- 当外部传入 `manualEditorMode` 时，模式切换入口隐藏并锁定。
- `开始时间`、`结束时间` 各自有独立输入与独立日历弹层。
- 日期时间模式：日历 + 小时/分钟列表与数字输入。
- 仅日期模式：隐藏小时/分钟面板，日期选择回写 `00:00:00`。
- 支持 DST overlap 的 from/to 独立消歧选择。

### 8.4 QuickPanel

- 快速搜索输入框。
- `Ctrl/Cmd + K` 聚焦搜索框。
- 分组完全由 `quickPresets[].group` 决定，按传入顺序渲染。
- 搜索范围覆盖 `label`、`group` 与 `keywords`。
- `quickSelectBehavior="commit"`：点选即提交并关闭。
- `quickSelectBehavior="commit"` 下若预设定义解析失败：不关闭面板，错误进入 `applyError` 区展示。
- `quickSelectBehavior="draft"`：仅写入草稿。

### 8.5 Footer

- 时区下拉来源于 `timezoneOptions`，默认显示 `UTC` / `浏览器`。
- 操作：`取消` / `确定`。
- 错误区：
  - `applyError`（提交时错误，`role="alert"`）
  - `draftError`（输入阶段错误）
- warning 区：展示 code 与本地化说明。
- 外部更新提示区：展示重置入口。

### 8.6 Apply 启用条件

当前实现仅在以下情况禁用“确定”按钮：

- 任一端点 parse 非 `ok`。

说明：区间顺序错误（`start >= end`）或解析阶段错误会在点击“确定”后显示 `applyError`，按钮本身保持可点击。

## 9. 无障碍与键盘交互

- Trigger：`aria-haspopup="dialog"` + `aria-expanded`。
- 输入错误提示：`role="alert"`。
- Popover 打开后聚焦 `lastFocused` 对应输入框。
- `Enter`：当按钮可用时执行 Apply。
- `Ctrl/Cmd + K`：聚焦快捷搜索输入。
- `Esc`：依赖 Popover 默认关闭行为。

## 10. 测试基线

### 10.1 核心解析测试

- 半开区间与 `round=up` 行为。
- `/unit + round=up` 不重复 round-down。
- 月末与闰年日历算术。
- DST gap / overlap。
- `@wall` 在不同时区下重算。

### 10.2 Draft 状态测试

- typing 不自动格式化，blur 后归一化。
- calendar/scroller 回写 `parts` 与格式化文本。
- 焦点切换不丢草稿。

### 10.3 端到端交互测试

- Apply 触发单一事件：`onResolvedChange`。
- `Ctrl/Cmd + K` 键盘聚焦。
- 输入错误可见性。
- 空态清除行为与不展开 Popover。
- 手动模式开关显隐。
- `manualEditorMode="date"` 下输入与 Trigger 显示规则。
- 区间顺序错误在 Apply 后给出明确错误文案。

## 11. 快捷项示例（使用方传入）

```typescript
const DEFAULT_QUICK_PRESETS = [
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
    key: "last-24h",
    label: "最近 24 小时",
    group: "最近",
    keywords: ["24h", "24小时"],
    definition: {
      from: { expr: "now-24h" },
      to: { expr: "now" },
      label: "最近 24 小时",
      ui: { editorMode: "relative" },
    },
  },
  {
    key: "today",
    label: "今天",
    group: "常用",
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
    definition: {
      from: { expr: "now/M" },
      to: { expr: "now/M", round: "up" },
      label: "本月",
      ui: { editorMode: "relative", rangeTokenMode: "two_endpoints" },
    },
  },
]
```
