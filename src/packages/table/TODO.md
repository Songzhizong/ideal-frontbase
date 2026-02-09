# Table TODO（持续优化清单）

更新时间：2026-02-07
范围：`src/packages/table`

## 使用说明
- 状态约定：`[ ]` 未开始，`[~]` 进行中，`[x]` 已完成。
- 优先级约定：P1（高）> P2（中）> P3（优化）。

---

## P1（高优先级，优先完成）

### 1. API 与类型契约收敛
- [ ] 调整 `DataTableColumnDef<TData>` 类型定义，避免 `never` 过度收窄推导。
  - 验收：
    - 列 `accessor/cell` 推导不退化。
    - 现有业务页面无类型回归。

- [ ] 重构 `FilterDefinition.options` 的类型，提升 `multi-select` 语义准确性。
  - 验收：
    - 多选字段配置无需类型断言。
    - `filter-item` / `advanced-search` 类型检查通过。

- [ ] 修复 `DataTablePreset` 的泛型透传问题（`selectionBarActions` 应携带 `TFilterSchema`）。
  - 验收：
    - `selectionBarActions` 中 `exportPayload` 类型不再是 `unknown`。

### 2. 伪 API 清理
- [ ] `retry(options)` 参数策略二选一：
  - 方案 A：实现 `resetInvalidFilters` 语义；
  - 方案 B：移除未生效参数，简化 API。
  - 验收：
    - 文档、类型、实现一致。

### 3. DragSort 结构治理（彻底版）
- [ ] 将 DnD 容器从表格体路径中解耦（不仅是 accessibility 容器规避）。
  - 验收：
    - 无 `<tbody>` 内非法节点警告。
    - SSR/hydration 无相关告警。

---

## P2（中优先级，近期推进）

### 1. 虚拟滚动能力增强
- [ ] 明确并实现虚拟滚动与 `dragSort/tree/subComponent/groupBy` 的共存策略（或显式禁用提示）。
  - 验收：
    - 冲突场景有稳定行为（启用/降级可预测）。
    - 至少覆盖 3 组组合场景回归测试。

- [ ] infinite 模式补充 `hasMore` 协议，避免无意义请求。
  - 验收：
    - `loadMore` 仅在 `hasMore=true` 时触发。
    - 触底高频滚动不会重复请求。

### 2. 分析能力企业化
- [ ] 为 analytics 增加服务端聚合/跨页聚合接入约定（协议 + UI 展示策略）。
  - 验收：
    - 可以接入后端返回的分组/汇总结果。
    - 不依赖前端全量数据即可渲染汇总。

### 3. 导出能力补强
- [ ] 在 `selectionScope/exportPayload` 之上补齐“任务化导出”能力（异步、进度、结果回执）。
  - 验收：
    - 支持大批量导出不中断主线程。
    - 支持“按条件导出（all + excluded）”。

---

## P3（优化项，按需排期）

### 1. 兼容包袱收敛（新实现可简化）
- [ ] 偏好存储统一协议：移除裸值兼容，仅保留 envelope。
- [ ] 区间值统一协议：对象/数组二选一，全链路统一。
- [ ] 评估移除 `DataTableInstance.__version` 运行时字段。
  - 验收：
    - 不影响现有功能。
    - 文档与类型定义同步更新。

### 2. 元信息类型化
- [ ] 用显式类型契约替代 `table.meta` 字符串 key 隐式通信。
  - 验收：
    - Core/UI 间 key 改名有编译期保护。
    - `helpers.ts` 不再依赖大量 `unknown + isRecord` 兜底。

---

## 测试补强（穿插执行）

- [ ] 类型回归：
  - `DataTablePreset` 泛型透传；
  - `FilterDefinition` 多选类型推导。

- [ ] 交互回归：
  - 虚拟滚动组合场景；
  - DragSort 结构治理后回归；
  - analytics 服务端数据接入链路。

- [ ] 稳定性回归：
  - infinite + hasMore + 滚动边界行为。

---

## 推荐执行顺序
1. P1（类型/API 契约 + 伪 API 清理 + DragSort 结构治理）
2. P2（虚拟滚动共存策略 + analytics + 导出）
3. P3（兼容包袱与元信息类型化）
4. 全程补齐回归测试并保持 `typecheck` 绿灯

