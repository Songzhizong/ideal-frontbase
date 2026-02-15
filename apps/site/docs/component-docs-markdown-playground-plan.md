# 组件文档 Markdown + Playground 改造计划

## 目标
- 让组件文档支持通过 Markdown 编写。
- 让示例代码与预览可按统一约定引入（后续支持 `playground` 指令）。
- 与现有 `renderDetail` 方案并存，逐步迁移，避免一次性替换带来的风险。

## 分阶段计划
1. 第 1 步（已完成）：建立 Markdown 文档源接入基础设施。
2. 第 2 步（本次继续，已完成 Input 试点）：实现 `playground` 区块解析与统一示例画廊组件。
3. 第 3 步（进行中）：落地 `markdown-only` 渲染模式，避免分块拼接导致的重复与约束。
4. 第 4 步：补充 API 自动同步与文档校验脚本（防止文档与实现漂移）。
5. 第 5 步：分组件迁移与回归验证（优先 Button/Input/Dialog/Table）。

## 第 1 步范围（已开始）
- 新增 Markdown 文档目录与示例文档。
- 新增 Markdown 文档注册器（基于 `import.meta.glob + ?raw`）。
- 扩展 `ComponentDoc` 类型，支持声明 Markdown 文档入口。
- 详情页接入 Markdown 渲染分支（与 `renderDetail` 并存，优先级不破坏现有行为）。

## 第 1 步验收标准
- 项目可正常 `typecheck`。
- 未配置 `markdownEntry` 的组件行为保持不变。
- 配置了 `markdownEntry` 且无 `renderDetail` 的组件可展示 Markdown 内容。

## 风险与处理
- 风险：当前阶段仅为 Markdown 基础接入，尚未支持交互示例自动注入。
- 处理：第 2 步补齐 `playground` 指令解析与预览/源码/复制一体化组件。
