# 框架架构与 API 规范 (Architecture & API)

本规范定义了项目的核心架构设计模式及数据访问层准则。

## 1. 业务逻辑架构 (Feature-Based)
项目采用以特性为中心的模块化设计，将 `apps/<app-name>/src/features/{name}` 视为独立的业务单元。

- **高内聚 (Colocation)**：将 API 定义、类型声明、业务组件、自定义 Hook 及 Mock 数据放置在同一特性目录下。
- **公共接口 (Public API)**：每个特性通过 `index.ts` 导出必要内容，禁止跨特性直接读取内部文件。
- **应用隔离**：禁止跨应用直接导入源码（例如 `apps/a` 导入 `apps/b`）；跨应用复用能力必须沉淀到 `packages/*`。
- **Mock 注入**：Mock 数据编写在 `apps/<app-name>/src/features/{name}/api/*.mock.ts` 或共享模块的 `packages/{name}/api/*.mock.ts` 中，并通过 `mockRegistry` 集中注册。

## 2. API 层规范 (Data Access Layer)
- **纯净性 (Purity)**：API 函数必须是纯函数。严禁在 API 层触发 UI 副作用（如 Toast、重定向）。
- **HTTP 客户端**：统一使用 `ky`，禁止使用 `axios` 或原生 `fetch`。
- **请求/响应协议**：
    - **请求 (DTO)**：使用 **Zod** 定义验证 Schema。
    - **响应 (Entity)**：使用 **TypeScript Interface** 定义数据结构（不建议使用 Zod 校验响应，以优化运行时性能）。

## 3. 状态管理准则
- **服务端状态**：统一使用 **TanStack Query**。
    - 使用 `useQuery` 进行数据读取 (GET)。
    - 使用 `useMutation` 进行数据变更 (POST/PUT/DELETE)。
- **URL 状态**：使用 **nuqs**。凡涉及表格、多标签页切换逻辑，必须遵循 [data-table.md](data-table.md)。
- **全局 UI 状态**：使用 **Zustand** 管理轻量级全局状态。
- **表单状态**：使用 **React Hook Form**。

---

> [!TIP]
> 遵循单一职责原则，确保 API 层只负责数据转换，业务逻辑在 Hook 层处理，UI 层只负责渲染。
