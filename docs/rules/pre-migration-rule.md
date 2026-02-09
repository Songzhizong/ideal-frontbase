# 预迁移执行规则（Pre-Migration Rule）

> 适用阶段：正式拆分 Monorepo（`apps/*` + `packages/*`）之前。
> 
> 适用目标：将可复用公共能力先迁入 `src/packages/*`，在不破坏现有业务的前提下完成“可拆包化”改造。

## 1. 目标与边界
- 目标：让 `src/packages/*` 成为未来独立包的真实实现目录。
- 边界：当前阶段不直接拆 workspace 子包，不强制一次性替换全部旧引用。
- 原则：稳定优先、渐进迁移、可回滚。

## 2. 目录约定
- 新实现目录：`src/packages/<module>/*`
- 旧路径目录：`src/components/*`、`src/hooks/*`、`src/lib/*`、`src/types/*` 等
- 默认策略：迁移完成后删除旧路径实现与目录，真实逻辑仅保留在 `src/packages/*`。
- Table 存量例外：`src/components/table/*` 视为应用内历史实现，可在 Monorepo 拆分时直接迁入 `apps/*`，不要求在预迁移阶段删除。

## 3. 代码迁移规则
- 迁移时将原文件移动到 `src/packages/<module>`，不要复制出两份实现。
- 迁移完成后删除旧路径同名文件与空目录，不创建兼容层文件（Table 存量目录除外）。
- 包内代码优先使用相对路径，避免反向依赖旧路径导致循环引用。
- 新增可复用能力时，优先落在 `src/packages/*`。
- 强业务耦合代码（页面、路由、具体业务流程）仍留在 `src/features/*`、`src/routes/*`。

## 4. 导入与清理规则
- 已迁移模块必须直接使用 `@/packages/*` 导入，不再引用旧路径。
- `src/components/table/*` 存量代码按应用内路径管理，不强制改为 `@/packages/table/*`。
- 每次迁移需同步替换受影响代码引用，不保留“后续再改”的旧导入。
- 每次迁移需同步更新相关文档中的路径与示例代码，避免文档失真。

## 5. Table 专项规则（共享实现 + 存量迁移）
- 共享表格能力目录：`src/packages/table/*`，对外入口统一为 `src/packages/table/index.ts`。
- 新增可复用表格能力时，统一在 `src/packages/table/*` 开发；禁止新增 `src/packages/table/v2/*`。
- `src/components/table/*` 定位为应用内存量实现：
  - 仅用于承接现有业务代码，Monorepo 拆分时直接迁入 `apps/<app>/src/components/table/*`。
  - 不再作为共享能力来源，不新增跨项目复用功能。
  - 可做必要缺陷修复与兼容调整，但不进行新架构演进。

## 6. 质量门禁
每次迁移完成后至少执行：
- `pnpm lint`
- `pnpm typecheck`

若迁移涉及测试文件或核心行为变更，补充执行相关测试（如 `pnpm test -- <pattern>`）。

## 7. 文档同步
每完成一批迁移，需要同步：
- 更新本文件中的迁移状态（模块清单）。
- 若影响开发约束，更新 `docs/rules/general_rule.md` 的对应章节。

## 8. 当前预迁移模块清单（持续维护）
- `ui`
- `theme-system`
- `error-core`
- `confirm`
- `platform-router`
- `ui-utils`
- `table`（共享实现位于 `src/packages/table/*`）
- `app-config`
- `mock-core`
- `auth-core`
- `shared-types`
- `api-core`
- `hooks-core`
- `layout-core`

## 9. 对 AIAgent 的执行指令（可直接引用）
当用户说“按预迁移规则执行”时，默认表示：
- 必须遵守本文件所有规则。
- 迁移后必须保留可运行状态（lint/typecheck 通过）。
- 若无额外说明，采用“新实现 + 删除旧目录/文件（Table 存量目录除外）+ 更新代码引用与文档”策略。
