# Site 工程背景（AIAgent 优先）

## 1. 文档目的
本文档用于帮助后续 AIAgent 或开发人员快速理解 `apps/site` 的目标、边界、目录约定和扩展方式。

`apps/site` 是 `ideal-frontbase` monorepo 下的官网站点应用，定位类似 Ant Design 官网的信息门户，当前提供四个一级页面入口：
- 首页
- 设计
- 研发
- 组件文档

## 2. 接手前必读
每次新会话开始后，先阅读并遵守：
- `docs/rules/general_rule.md`

关键约束（高频易错）：
- 站内跳转必须使用 `BaseLink` 或 `useBaseNavigate`，不要使用硬编码 `<a href="/...">` 或 `window.location`。
- 优先复用 `@/packages/ui`，不要在应用层重复造基础组件。
- 样式优先语义化令牌与 Tailwind 工具类，避免硬编码颜色。
- TypeScript 严格模式，禁止 `any`。
- 不要手改 `src/routeTree.gen.ts`（路由生成产物）。

## 3. 工程定位与边界
### 3.1 定位
`apps/site` 是文档与品牌站，不承担后台鉴权业务和复杂数据 CRUD。

当前目标：
- 对外展示模板工程能力
- 给开发者提供统一上手入口
- 作为团队规范与组件文档沉淀载体

### 3.2 monorepo 边界
- 站点代码仅在 `apps/site/src/*`。
- 共享能力从 `packages/*` 引用（例如 `@/packages/ui`、`@/packages/platform-router`、`@/packages/theme-system`）。
- 禁止导入其他应用源码（如 `apps/nexus`、`apps/infera`）。

## 4. 当前实现快照
### 4.1 技术栈
- React 19
- TypeScript（strict）
- Vite
- Tailwind CSS 4
- TanStack Router（文件路由）
- Biome

### 4.2 目录分层（已从 `features/site` 拆分）
- `apps/site/src/features/shell/layout/*`：站点通用壳层（顶栏、页脚、导航）。
- `apps/site/src/features/home/pages/*`：首页页面实现。
- `apps/site/src/features/design/pages/*`：设计页面实现。
- `apps/site/src/features/engineering/pages/*`：研发页面实现。
- `apps/site/src/features/component-docs/content/*`：每个组件独立文档文件。
- `apps/site/src/features/component-docs/data/*`：组件文档注册表与类型定义。
- `apps/site/src/features/component-docs/layout/*`：组件文档页专用布局（含侧边栏）。
- `apps/site/src/features/component-docs/pages/*`：组件文档总览和详情页。

### 4.3 路由结构
- `/`：首页
- `/design`：设计
- `/engineering`：研发
- `/components`：组件文档总览（带独立侧边栏布局）
- `/components/$componentSlug`：组件详情

组件文档路由采用嵌套路由：
- `apps/site/src/routes/components/route.tsx`
- `apps/site/src/routes/components/index.tsx`
- `apps/site/src/routes/components/$componentSlug.tsx`

### 4.4 组件文档模型
组件文档采用“独立文件 + 注册表”模式：
1. 每个组件文档在 `features/component-docs/content/` 下独立维护。
2. 在 `features/component-docs/data/component-docs.ts` 中注册。
3. 侧边栏与详情页从注册表驱动渲染。

这保证后续新增组件文档只需“新增文件 + 注册”两步。

## 5. 开发流程（AIAgent 默认遵循）
1. 修改页面、组件文档或路由源码。
2. 生成路由产物：
   - `pnpm --filter ./apps/site routes:generate`
3. 执行质量检查：
   - `pnpm --filter ./apps/site lint`
   - `pnpm --filter ./apps/site typecheck`
4. 需要构建验证时执行：
   - `pnpm --filter ./apps/site build`

本地启动：
- `pnpm dev:site`

## 6. 常见扩展任务
### 6.1 新增一级页面
1. 在对应 `features/<domain>/pages/` 新建页面组件。
2. 在 `src/routes/` 新建路由文件。
3. 在 `features/shell/layout/nav-items.ts` 添加导航项。
4. 执行 `routes:generate` + `lint` + `typecheck`。

### 6.2 新增组件文档页（带侧边栏自动出现）
1. 新建 `features/component-docs/content/<component>-doc.ts`。
2. 在 `features/component-docs/data/component-docs.ts` 注册文档对象。
3. 通过 `/components/<slug>` 访问并验证。
4. 执行 `lint` + `typecheck`。

### 6.3 增强组件详情内容
推荐在文档模型中扩展字段（例如示例代码、注意事项、版本变更），不要把结构化文档写死在页面组件内。

## 7. 明确禁止事项
- 不要手动编辑 `apps/site/src/routeTree.gen.ts`。
- 不要为站点文案需求直接修改 `packages/ui` 底层实现。
- 不要从 `apps/site` 直接导入其他 app 源码。
- 不要引入与官网目标无关的全局状态和复杂数据层。

## 8. 下一步建议
1. 将 `features/component-docs/content/*` 扩展为完整组件清单。
2. 为组件详情补充“示例代码块 + Props 表 + FAQ”三段式内容。
3. 引入全文搜索（先本地索引，再评估外部搜索服务）。
