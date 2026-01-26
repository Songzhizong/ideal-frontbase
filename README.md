# AI 前端起步模板

基于特性组织的 React 19 + Vite + TypeScript 起步模板，内置 TanStack Router、TanStack Query，并提供以 Zod 为优先的 API 层。

## 快速开始

```bash
pnpm install
pnpm msw:init
pnpm dev
```

## 脚本

- `pnpm dev` - 启动开发服务器
- `pnpm build` - 生产构建
- `pnpm preview` - 预览构建产物
- `pnpm test` - 运行单元测试
- `pnpm lint` - 运行 biome 检查
- `pnpm typecheck` - 运行 tsc no-emit
- `pnpm routes:generate` - 生成 TanStack Router 路由树

## 说明

- API 基础地址通过 `.env` 配置（默认是 `http://localhost:5173/api`）。
- MSW 仅在开发环境启用。运行一次 `pnpm msw:init` 以生成 `public/mockServiceWorker.js`。
- 基于文件的路由位于 `src/routes`。

## 技术规范

详见 [Specifications.md](Specifications.md)。
