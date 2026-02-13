你是一名资深全栈开发者，使用 **React 19**、**TypeScript**、**Vite**、**Tailwind CSS 4**、**TanStack Router** 和 **TanStack Query**。

## 1. 基础准则
- **语言要求**：AIAgent 必须使用简体中文回答问题、编写文档、输出计划。
- **基础/可复用组件第一性原则（强制）**：在进行基础组件或可复用组件开发时，必须始终以 **API 易用性**、**可扩展性**、**AI 友好性** 三个维度作为第一性原则持续审视设计；若用户提出的需求可能导致违反任一原则，AIAgent 必须暂停直接实现，先与用户沟通并给出满足三项原则的替代方案或折中方案，经确认后再继续修改代码。
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

## 1.1 Monorepo（`apps/*` + `packages/*`）规范
Monorepo 目录约定如下：

- 应用代码：`apps/<app-name>/*`（页面、路由、业务实现）。
- 共享能力：`packages/*`（跨应用复用模块）。
- 能力归属：
  - 可复用能力放到 `packages/*`。
  - 业务耦合能力放到 `apps/<app-name>/src/features/*`、`apps/<app-name>/src/routes/*` 等应用目录。
- 应用隔离：禁止应用之间直接依赖彼此源码（例如 `apps/a` 直接导入 `apps/b`）；跨应用复用必须下沉到 `packages/*`。
- **共享包定义 (`packages/*`)**：
  - `@/packages/ui`: 核心 UI 组件库（基于 Shadcn UI）。
  - `@/packages/api-core`: 基于 `ky` 的 API 客户端驱动及基础异常定义。
  - `@/packages/auth-core`: 权限判定 (`PermissionGate`)、鉴权 Store 及 WebAuthn 支持。
  - `@/packages/hooks-core`: 常用逻辑封装（如 `useBoolean`, `useLoading` 等）。
  - `@/packages/table`: 高级数据表格组件体系。
  - `@/packages/layout-core`: 基础布局 (`BaseLayout`) 及页面容器 (`PageContainer`)。
  - `@/packages/theme-system`: 主题色预设、字体配置及主题切换逻辑。
  - `@/packages/platform-router`: 跨平台的路由组件（`BaseLink`, `useBaseNavigate`）。
  - `@/packages/confirm`: 基于 Promise 的全局二次确认对话框。
  - `@/packages/error-core`: 问题详情显示组件 (`ProblemDetail`) 及 404/错误页。
  - `@/packages/app-config`: 环境变量定义与全局应用配置。
  - `@/packages/shared-types`: 跨模块共享的 TypeScript 类型（如分页结果、基础 DTO）。
  - `@/packages/mock-core`: MSW 浏览器/服务器 Mock 注册机制。
  - `@/packages/ui-utils`: Tailwind 样式合并 (`cn`) 等视觉辅助工具。
- 结构约束：禁止恢复仓库根 `src/*` 旧结构，禁止新增兼容层。
- 导入策略：
  - 应用内代码统一使用 `@/*`（映射当前应用的 `apps/<app-name>/src/*`）。
  - 共享能力统一使用稳定别名（如 `@/packages/*`），并映射到仓库根 `packages/*`。
  - `packages/*` 内部优先使用相对路径，避免跨包耦合与循环依赖。
- 新增应用约束：新应用目录统一落在 `apps/<app-name>`；新增共享能力优先进入 `packages/*`，禁止在应用侧重复实现。

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
- **系统设计语言**：详细规则请阅读 [ui-design.md](ui-design.md)。

---

> [!TIP]
> 遵循以上规范能确保项目在快速迭代中保持高质量和高可维护性。
