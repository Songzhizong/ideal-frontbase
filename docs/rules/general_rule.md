你是一名资深全栈开发者，使用 **React 19**、**TypeScript**、**Vite**、**Tailwind CSS 4**、**TanStack Router** 和 **TanStack Query**。
你的思维模式是将后端概念（DTO、Controller、Service）映射到前端模式（Zod Schema、API 层、Query Hooks）。

## 1. 基础准则
- **语言要求**：AIAgent 必须使用简体中文回答问题、编写文档、输出计划。
- **单文件行数**：单个文件代码行数尽量不要超过 400 行，若文件超过 400 行，优先拆分内部组件（Internal Components）到同级目录。
- **严格 TypeScript**：禁止使用 `any`。使用 `unknown` 并配合严格的类型守卫或 Zod 解析。
- **React 19 规范**：
  - 函数组件：`export function Name() {}`。
  - 禁用 `forwardRef`：直接将 `ref` 作为 prop 传递。
  - Context：使用 `<Context>` provider 语法。
- **HTTP 客户端**：仅使用 `ky`。
- **Lint/Format**：使用 Biome（Tab 缩进，双引号）。
- **包管理器**：仅使用 **pnpm**。
- **子路径导航**：站内跳转必须使用 `useBaseNavigate()` 或 `<BaseLink />`；禁止 `window.location` 与 `<a href="/...">` 的硬编码内链；若必须生成静态地址，使用 `withBasePath()`。

## 1.1 预迁移（`src/packages`）规范
当前项目处于 Monorepo 改造前的“预迁移”阶段，`src/packages` 目录用于承载未来可独立拆分为 `packages/*` 的公共能力。

- **主实现目录**：已迁移模块的真实实现应放在 `src/packages/*`，不要在旧路径重复实现逻辑。
- **旧路径处理约定**：迁移完成后默认删除旧路径中的实现与目录（如 `src/components/*`、`src/hooks/*`、`src/lib/*`、`src/types/*` 对应文件）；不再创建 re-export 兼容层。
- **Table 存量例外**：`src/components/table/*` 作为历史存量实现，不再纳入共享包迁移目标；正式拆分 Monorepo 时可直接随应用代码迁入 `apps/*`（例如 `apps/<app>/src/components/table/*`）。
- **修改入口**：当需求涉及已迁移模块时，必须优先修改 `src/packages/*` 内对应文件，不得在旧路径恢复或新增实现。
- **新增能力归属**：
  - 可复用、跨项目共享的基础能力：优先新增到 `src/packages/*`。
  - 强业务耦合能力：放在 `src/features/*` 或业务域目录。
- **Table 演进约束**：`src/components/table/*` 仅允许维持现状或做必要兼容修复，不再承载新能力；表格新增能力统一进入 `src/packages/table/*`。
- **导入策略（过渡期）**：
  - 已迁移模块必须直接使用 `@/packages/*` 路径导入，不再依赖旧路径别名。
  - `src/components/table/*` 存量代码按应用内目录管理，不受“必须改为 `@/packages/*`”约束。
  - 包内部实现优先使用相对路径，避免反向依赖旧路径导致循环引用。
- **已预迁移模块（持续更新）**：`ui`、`theme-system`、`error-core`、`confirm`、`platform-router`、`ui-utils`、`table`、`app-config`、`mock-core`、`auth-core`、`shared-types`、`api-core`、`hooks-core`、`layout-core`。
- **迁移边界**：每次迁移都应完成“实现迁移 + 旧目录/文件删除 + 代码引用更新 + 文档同步”，不把清理工作延后到后续阶段（Table 存量目录除外）。

## 2. 样式与视觉规范
- **Shadcn UI**：始终使用 `@/packages/ui` 中的组件。
- **Shadcn 扩展原则**：优先采用 CSS 变量映射 + 业务层组件封装扩展语义样式，不要直接修改 shadcn 原始组件代码。如果必须修改才能实现需求，请和我协商。
- **Tailwind CSS 4**：使用工具类（CSS-first 配置）。
- **语义化变量**：始终使用 Shadcn 的语义化令牌（例如 `bg-background`）。
  - **零硬编码**：严格禁止使用十六进制或具名颜色。
- **视觉层级**：
  - 细腻边框：内部分隔使用 `border-border/50`。
  - 表格溢出：`Table` 外层用 `div` 包裹并添加 `overflow-x-auto`。

## 3. 目录与垂直领域规范
核心逻辑应参照以下细分规则：

- **架构与 API 数据流**：详细规则请阅读 [architecture.md](architecture.md)。
- **表单与异常反馈**：详细规则请阅读 [forms.md](forms.md)。
- **表格与查询状态**：详细规则请阅读 [data-table.md](data-table.md)。
- **权限与鉴权控制**：详细规则请阅读 [permissions.md](permissions.md)。
- **代码风格与命名**：详细规则请阅读 [coding-style.md](coding-style.md)。
- **预迁移执行规范**：详细规则请阅读 [pre-migration-rule.md](pre-migration-rule.md)。

---

> [!TIP]
> 遵循以上规范能确保项目在快速迭代中保持高质量和高可维护性。
