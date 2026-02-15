# 组件文档模板（markdown-only）

## 1. 目标
用于快速创建新组件说明页，覆盖三件套：
1. 元数据：`content/*.ts`
2. 正文：`markdown/zh-CN/components/*.md`
3. 示例：`playground/<component>/*.tsx`

## 2. 使用步骤
1. 复制 `content.template.ts` 到：
   - `apps/site/src/features/component-docs/content/<component>-doc.ts`
2. 复制 `markdown.template.md` 到：
   - `apps/site/src/features/component-docs/markdown/zh-CN/components/<component>.md`
3. 复制 `playground/*.template.tsx` 到：
   - `apps/site/src/features/component-docs/playground/<component>/`
4. 统一替换占位符：
   - `__COMPONENT_SLUG__`
   - `__COMPONENT_NAME__`
   - `__COMPONENT_CATEGORY__`
   - `__DOCS_PATH__`
5. 在 `apps/site/src/features/component-docs/data/component-docs.ts` 注册文档。

## 3. 命名约定
- playground 文件名使用 `kebab-case`。
- 示例建议至少包含：
  - `basic-usage.tsx`
  - `form-integration.tsx`
