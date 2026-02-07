# 表格组件 V2 设计：偏好持久化与迁移

## 20. 偏好持久化：合并、校验与版本迁移

`columnVisibility/columnSizing/density` 等偏好属于“用户资产”。一旦列定义发生变更（新增/删除/重命名列），如果没有明确的 **合并与迁移规则**，就会出现偏好污染（隐藏新列、列宽错乱、无法恢复默认）或体验跳变。

### 25.1 存储值建议使用 Envelope

建议所有偏好采用统一 envelope 格式，便于迁移与诊断：

```ts
export interface PreferenceEnvelope<TValue> {
  schemaVersion: number
  updatedAt: number
  value: TValue
}
```

### 25.2 合并规则（必须明确）

以列可见性与列宽为例，读取存储值后建议执行以下步骤：

1. 丢弃已不存在的 columnId（列被删除或重命名）
2. 对新增列使用默认值（`defaultVisible/defaultSizing` 或列定义默认）
3. 对列宽做约束修正（最小/最大宽度、非法值丢弃）
4. 保持稳定输出（key 排序稳定化，避免无意义的 diff 与渲染抖动）

合并示意（伪类型）：

```ts
export interface PreferenceMergeContext {
  columnIds: string[]
}

export function mergeRecordPreference<TValue>(args: {
  stored: Record<string, TValue> | null
  defaults: Record<string, TValue>
  ctx: PreferenceMergeContext
}): Record<string, TValue> {
  const next: Record<string, TValue> = {}
  for (const id of args.ctx.columnIds) {
    next[id] = args.stored?.[id] ?? args.defaults[id]
  }
  return next
}
```

### 25.3 版本迁移与列定义变更检测

建议偏好 feature 提供迁移入口（可选），用于处理 schemaVersion 升级或列重命名：

```ts
export interface PreferenceMigrationContext {
  columnIds: string[]
}

export type PreferenceMigration<TValue> = (args: {
  fromVersion: number
  toVersion: number
  value: TValue
  ctx: PreferenceMigrationContext
}) => TValue
```

推荐约定：

- 当 `schemaVersion` 小于当前版本时，按顺序执行迁移函数（或直接丢弃回默认）
- 当列发生“可识别的重命名”时，迁移函数可将旧 key 映射到新 key
- 当无法安全迁移时，应选择“回退默认值”，同时让 `activity.preferencesReady` 表达 hydration 完成

---

