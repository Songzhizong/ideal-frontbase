# 组件文档模板（markdown-only）

## 1. 目标
用于快速创建新组件说明页，覆盖三件套：
1. 元数据：`content/*-doc.ts`（可选）
2. 正文：`markdown/zh-CN/components/*.md`
3. 示例：`playground/<component>/*.tsx`

## 2. 使用步骤
1. 复制 `markdown.template.md` 到：
   - `apps/site/src/features/component-docs/markdown/zh-CN/components/<component>.md`
2. 复制 `playground/*.template.tsx` 到：
   - `apps/site/src/features/component-docs/playground/<component>/`
3. 统一替换占位符：
   - `__COMPONENT_SLUG__`
   - `__COMPONENT_NAME__`
4. 如需覆盖默认元数据或新增 catalog 外组件，再复制 `content.template.ts` 到：
   - `apps/site/src/features/component-docs/content/<component>-doc.ts`
5. 文档会被自动发现，无需在 `data/component-docs.ts` 手工注册。

## 2.1 何时需要 `content/*-doc.ts`
- 组件已经存在于默认 catalog，仅写 markdown 即可。
- 需要自定义 `name/category/status/since/docsPath` 时，新增 `content` 元数据文件。
- 组件不在默认 catalog 中时，必须新增 `content` 元数据文件。

## 3. 命名约定
- playground 文件名使用 `kebab-case`。
- 示例建议至少包含：
  - `basic-usage.tsx`
  - `form-integration.tsx`

## 4. 编写注意事项（与渲染器契约保持一致）
- `DataTable` 的 `:data` 只能写字面量数组对象，禁止函数调用/变量引用等可执行表达式。
- 标题（`##`、`###`）请单独成段，标题前后保留空行，避免与正文写在同一段导致 TOC 锚点异常。
