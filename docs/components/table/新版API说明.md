**新 API（最终简明版）**

```typescript
type DataTableQueryFieldPanelSlot = "primary" | "secondary" | "hidden"

interface DataTableQueryFieldSearchConfig {
  enabled?: boolean
  pickerVisible?: boolean
  order?: number
}

interface DataTableQueryFieldUiConfig {
  panel?: DataTableQueryFieldPanelSlot
  containerClassName?: string
}

interface DataTableQueryField<TFilterSchema, TValue = unknown> {
  id: string
  label: string
  kind: FilterType
  binding: DataTableQueryFieldBinding<TFilterSchema, TValue>
  search?: DataTableQueryFieldSearchConfig
  ui?: DataTableQueryFieldUiConfig
  placeholder?: string
  options?: ReadonlyArray<{ label: string; value: unknown }>
  chip?: { hidden?: boolean; formatValue?: (value: TValue) => string }
}

interface DataTableQuerySchema<TFilterSchema> {
  fields: readonly DataTableQueryField<TFilterSchema>[]
  search?: {
    mode?: "simple" | "advanced"
    defaultFieldId?: string
    debounceMs?: number
    placeholder?: string
    className?: string
  } | false
}

```

**目录结构（已保持功能分层）**

- /Users/zzsong/work/infrastructure/front/ideal-frontbase/packages/table/ui/query
- /Users/zzsong/work/infrastructure/front/ideal-frontbase/packages/table/ui/table
- /Users/zzsong/work/infrastructure/front/ideal-frontbase/packages/table/ui/columns
- /Users/zzsong/work/infrastructure/front/ideal-frontbase/packages/table/ui/cells
- /Users/zzsong/work/infrastructure/front/ideal-frontbase/packages/table/ui/config
- /Users/zzsong/work/infrastructure/front/ideal-frontbase/packages/table/ui/preset
- 对外统一入口：[index.ts](app://-/index.html#)

**完整修改方案与配置示例**

```typescript
const query = createDataTableQueryPreset<Filters>({
  schema: {
    fields: [
      {
        id: "keyword",
        label: "关键字",
        kind: "text",
        search: { pickerVisible: false, order: 1 }, // 收敛到搜索框，且不在字段选择器重复
        ui: { panel: "hidden" }, // 不在右侧重复渲染
        binding: { mode: "single", key: "keyword" },
        placeholder: "搜索姓名、账号、手机号或邮箱",
      },
      {
        id: "status",
        label: "状态",
        kind: "select",
        search: { enabled: true, order: 2 }, // 可被 advanced 搜索收敛
        ui: { panel: "hidden" },
        binding: { mode: "single", key: "status" },
        options: [{ label: "全部", value: "" }, { label: "已锁定", value: "true" }],
      },
      {
        id: "mfa",
        label: "MFA",
        kind: "select",
        ui: { panel: "primary", containerClassName: "w-[180px]" }, // 显示在搜索框右侧
        binding: { mode: "single", key: "mfa" },
        options: [{ label: "全部", value: "" }, { label: "已开启", value: "true" }],
      },
      {
        id: "timeRange",
        label: "时间范围",
        kind: "custom",
        ui: { panel: "secondary" }, // 默认隐藏，点展开显示
        binding: {
          mode: "composite",
          keys: ["startTimeMs", "endTimeMs"],
          getValue: (f) => ({ from: f.startTimeMs, to: f.endTimeMs }),
          setValue: (v) => ({ startTimeMs: v.from ?? null, endTimeMs: v.to ?? null }),
          clearValue: () => ({ startTimeMs: null, endTimeMs: null }),
        },
      },
    ],
    search: {
      mode: "advanced",
      defaultFieldId: "keyword",
      placeholder: "搜索...",
      className: "w-[460px]",
    },
  },
  layout: {
    mode: "stacked", // 上 actions，下搜索区；inline 则同排
    secondary: { collapsible: true, defaultExpanded: false },
  },
  slots: {
    actionsLeft: <LeftActions />,
    actionsRight: <RightActions />,
  },
})

```

字段控制规则：

- 收敛到搜索框内：field.search.enabled=true（text 默认 true），通常配合 field.ui.panel="hidden"。
- 显示在搜索框右侧：field.ui.panel="primary"，且不启用 field.search.enabled。
- 默认隐藏（可展开）：field.ui.panel="secondary" + layout.secondary.defaultExpanded=false。
- 永久隐藏但可搜索：field.ui.panel="hidden" + field.search.enabled=true。

**关键设计决策**

- 搜索语义完全字段化：search.enabled/pickerVisible/order。
- [schema.search](app://-/index.html#) 仅保留行为配置，不再允许 fieldIds。
- 引入 ui.panel 明确布局语义，避免把筛选塞到 actions。
- advanced 字段选择器只看 pickerFields，支持“默认字段不重复展示”。
- 复合字段与 chips/clear 继续由 binding.composite 单点驱动。

**删除的旧代码/旧 API**

- DataTableQueryFieldPlacement 类型。
- field.placement、field.searchable、field.containerClassName。
- search.fieldIds。
- 对应旧测试断言（已迁移到新字段级语义），未保留兼容层或别名。

**运行结果**

- pnpm --filter @ideal-frontbase/table typecheck 通过。
- pnpm --filter @ideal-frontbase/infera typecheck 通过。
- pnpm --filter @ideal-frontbase/nexus typecheck 通过。
- pnpm exec biome check（分别在 root/infera/nexus 对改动文件）通过。
- pnpm exec vitest run --dir ../../packages/table/ui/query --reporter=dot（在 apps/infera）通过，6 文件 16 用例。
- pnpm exec vitest run --dir ../../packages/table/ui/preset --reporter=dot（在 apps/infera）通过，1 文件 2 用例。

**给 AIAgent 的标准用法模板（可直接复制）**

```
请在 /Users/zzsong/work/infrastructure/front/ideal-frontbase 按 DataTable Query v2 实现，严格遵守：
1. 先读取 docs/rules/general_rule.md 与 AGENTS.md。
2. 只用新 API：field.search / field.ui；禁止 placement/searchable/search.fieldIds。
3. 不做兼容层，不新增旧 API 别名，不使用 any。
4. 查询区语义要求：
   - 收敛到搜索框内：field.search.enabled=true（text 默认 true）
   - 右侧常显：field.ui.panel="primary"
   - 默认隐藏可展开：field.ui.panel="secondary" + layout.secondary.defaultExpanded=false
   - 默认搜索字段不在 picker 重复：field.search.pickerVisible=false
5. 复合字段必须用 binding.mode="composite"，chip/clear 语义一致。
6. 重复 value 工具统一到 packages/table/ui/query/filters/value-utils.ts。
7. 测试与实现同目录共置（*.test.tsx），并更新导出。
8. 对外只允许从 packages/table/ui/index.ts 导出，业务侧禁止深链导入。
9. 完成后执行：
   - pnpm --filter @ideal-frontbase/table typecheck
   - pnpm --filter @ideal-frontbase/infera typecheck
   - pnpm --filter @ideal-frontbase/nexus typecheck
   - 在 apps/infera 下执行：
     pnpm exec vitest run --dir ../../packages/table/ui/query
     pnpm exec vitest run --dir ../../packages/table/ui/preset
   - biome check（按改动文件）
10. 输出：变更文件、关键决策、删除旧代码、运行结果。
```

