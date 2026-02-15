# 组件文档契约（AIAgent 编写必读）

## 1. 目的与适用范围
- 本契约用于统一 `apps/site` 组件详情页的文档结构、渲染方式与交付质量。
- 适用对象：所有新增或修改以下路径的 AIAgent 与开发者。
  - `apps/site/src/features/component-docs/content/*`
  - `apps/site/src/features/component-docs/markdown/zh-CN/components/*`
  - `apps/site/src/features/component-docs/playground/*`

## 2. 编写前流程（强制）
每次开始编写组件文档前，必须按顺序完成：
1. 阅读 `docs/rules/general_rule.md`。
2. 阅读本文档 `apps/site/docs/components-doc-contract.md`。
3. 阅读工程背景 `apps/site/docs/agent-context.md`。

若任一步骤未执行，不允许开始文档编写。

## 3. 文档形态与目录契约
### 3.1 默认采用 markdown-only
- 新组件文档默认采用 `renderMode: "markdown-only"`。
- 页面主体内容应写在单个 markdown 文件中，不做分块拼接。

### 3.2 文件职责划分
- `content/*.ts(x)`：组件元数据（`slug/name/category/status/since/docsPath` 等）与入口注册。
- `markdown/zh-CN/components/*.md`：完整说明文档正文。
- `playground/<component>/*.tsx`：可运行示例源文件。

### 3.3 标准注册动作
新增组件文档时必须完成：
1. 新增 `content` 元数据并设置 `markdownEntry`。
2. 在 `data/component-docs.ts` 中注册。
3. 新增对应 markdown 文件。
4. 若有示例，新增 playground 文件并在 markdown 中通过指令引用。

### 3.4 注册防错示例（推荐直接复用）
优先使用静态 `import`，禁止 `require` 或动态拼接路径：

```ts
// content/example-doc.ts
import type { ComponentDoc } from "@/features/component-docs/data/types"

export const exampleDoc: ComponentDoc = {
  slug: "example",
  name: "Example",
  category: "基础组件",
  status: "stable",
  since: "0.1.0",
  summary: "示例组件说明",
  usage: "示例用法描述",
  docsPath: "packages/ui/example.tsx",
  markdownEntry: "example",
  renderMode: "markdown-only",
  scenarios: ["场景 A", "场景 B", "场景 C"],
  notes: ["注意事项 A"],
  api: [],
}
```

```ts
// data/component-docs.ts
import { exampleDoc } from "@/features/component-docs/content/example-doc"

export const COMPONENT_DOCS = [
  // ...existing docs
  exampleDoc,
] as const
```

如需快速起步，可直接复制模板目录：
- `apps/site/docs/templates/component-doc/`

## 4. Markdown 渲染契约
### 4.1 支持的示例指令
使用 fenced code block，语言标记为 `playground`：

```playground
basic
advanced
```

- 每一行对应一个示例文件名（不带 `.tsx`）。
- 对应路径：`playground/<component>/<file>.tsx`。
- 文件名必须使用 `kebab-case`（如 `basic-usage`、`form-integration`）。
- 展示规则：
  - 有预览的代码块默认折叠（支持展开、复制、语法高亮）。
  - 普通 fenced code 默认展开。

### 4.2 支持的数据表指令
支持 `<DataTable />` 指令，`preset` 可用值：
- `props`
- `emits`
- `slots`
- `types`

建议优先使用 `preset`，保证列结构一致与可读性。

### 4.3 页内导航（TOC）约束
- 右侧页内导航基于 markdown 标题自动生成。
- 建议以 `##`、`###` 为主，标题简短且可读。
- 避免同级大量重复标题名称。

## 5. 页面结构契约（建议顺序）
以下顺序为推荐模板，允许按组件特性裁剪，但必填章节不能缺失：
1. 组件简介（必填）
2. 何时使用（必填）
3. 代码演示（必填）
4. 属性说明（API）（必填）
5. 状态指南（推荐）
6. 尺寸/变体（推荐，若组件支持）
7. 样式变量（推荐，若组件支持主题令牌）
8. 类型（推荐）
9. FAQ（必填）
10. A11y（按需，但交互组件强烈建议）
11. 版本与迁移（按需）
12. 相关资源（按需）

## 6. 各章节最低要求
### 6.1 组件简介
- 1 到 3 句，描述核心价值与边界，不写营销语。

### 6.2 何时使用
- 至少 3 条推荐场景。
- 若存在常见误用，至少 1 条“不建议使用场景”。

### 6.3 代码演示
- 至少 2 个示例：基础示例 + 业务示例。
- 每个示例必须可预览、可查看源码、可复制。

### 6.4 API
- 使用 `DataTable preset="props"`。
- API 至少 3 行（组件确实无 props 时需明确说明）。
- 字段与 `packages/ui/*` 实际类型定义保持一致。
- 禁止猜测 Props/类型。必须以源码中的 `interface` / `type` / 导出声明为准。
- 若当前无法确认源码定义，必须显式标注 `[TBD: 待补源码校对]`，不得编造字段。

### 6.5 类型
- 组件有导出类型时，使用 `DataTable preset="types"` 维护。
- Union 类型值应可读，不得粘贴难以阅读的原始声明块。

### 6.6 FAQ
- 至少 2 条真实高频问题。
- 答案必须给出明确做法，优先附最小代码片段。

### 6.7 A11y（交互组件推荐）
- 建议覆盖键盘操作、焦点行为、ARIA/语义说明。
- 存在限制时需明确限制与替代方案。

## 7. 文案与工程约束
- 使用简体中文，表达准确、可执行。
- 在 `playground/*.tsx` 或其他 React 示例代码中，站内跳转使用 `BaseLink` 或 `useBaseNavigate`。
- Markdown 正文当前不承诺渲染 `[text](url)` 为可点击路由链接；需要站内跳转示例时，应在代码片段中展示 `BaseLink` 用法。
- 当前主语言目录为 `markdown/zh-CN/components`；若新增 `en-US`，必须保持与 `zh-CN` 相同文件名与目录结构（对称维护）。
- 文本描述尽量使用中文（代码标识符、类型名、API 名称除外），避免无必要英文长段落。
- 严格 TypeScript，禁止 `any`。
- 样式使用语义化令牌，不写硬编码颜色。
- 示例代码优先复用 `@/packages/ui`。

## 8. DoD（完成定义）
满足以下条件才可视为“文档完成”：
1. 必填章节完整（简介、何时使用、代码演示、API、FAQ）。
2. 页面可在 `/components/<slug>` 正常访问。
3. markdown 与 playground 引用关系正确，无“示例加载失败”。
4. API/类型与源码定义一致。
5. 质量检查通过：
   - `pnpm --filter @ideal-frontbase/site exec biome check <changed-files>`
   - `pnpm --filter @ideal-frontbase/site typecheck`
6. `apps/site/docs/components-page-checklist.md` 对应组件状态已更新。

## 9. 提交前自检清单
- [ ] 使用 markdown-only 并完成注册
- [ ] 示例可运行、可复制、可阅读
- [ ] API 与源码类型一致
- [ ] 类型表格可读性良好
- [ ] FAQ 为真实问题并可执行
- [ ] 已执行 Biome 与 Typecheck
