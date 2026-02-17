# Typography 指南（字号使用指导规范）

> 适用范围：`apps/*` 与 `packages/*` 的 Web 控制台页面（云计算 / AI SaaS）。
>
> 目标：在高信息密度下保持可扫读性、操作效率与一致性，并兼顾 AI 长文本阅读体验。

## 1. 原则

1. 语义优先：只通过语义 token 或组件默认字号表达层级，禁止硬编码字号。
2. 基线统一：正文统一以 `14px` 为基线，不同层级通过 token 扩展。
3. 场景分层：控制台操作区优先密度，AI 内容阅读区优先耐读性。
4. 可访问性：中文正文最小不低于 `12px`，保证低分屏可读性。

## 2. 全局字号标尺（Token）

| Token               | 字号        | 行高      | 典型用途                         |
|---------------------|-----------|---------|------------------------------|
| `text-2xs`          | 11px      | 16px    | 极小英文标签、状态角标数字、时间戳尾注          |
| `text-xs`           | 12px      | 18px    | 辅助说明、注释、次级元信息                |
| `text-sm`           | 13px      | 20px    | 表格正文、紧凑交互文本                  |
| `text-base`         | 14px      | 22px    | 正文、输入值、按钮默认                  |
| `text-lg`           | 16px      | 24px    | 卡片标题、小节标题                    |
| `text-xl`           | 20px      | 30px    | 区块标题                         |
| `text-2xl`          | 24px      | 34px    | 页面标题（常规）                     |
| `text-3xl`          | 30px      | 40px    | 页面标题（重点）                     |
| `text-chat-message` | 15px      | 26px    | AI 聊天正文（移动端）                 |
| `text-code`         | 12px-13px | 1.3-1.4 | CLI、YAML、代码块（配合 `font-mono`） |

补充：
- 桌面端（`>=768px`）AI 聊天正文使用 `16px/24px`。
- 全局 `body` 基线为 `14px/22px`。
- 若项目暂未定义 `text-code` token，临时使用 `text-sm + font-mono`。

## 3. 字重规范（Font Weight）

| 语义角色           | 字重                   |
|----------------|----------------------|
| 正文、说明文案        | `font-normal`（400）   |
| Label、表头、次级标题  | `font-medium`（500）   |
| 页面标题、关键指标、核心金额 | `font-semibold`（600） |

## 4. 语义映射（建议）

| 语义角色                        | 推荐 token                                        |
|-----------------------------|-------------------------------------------------|
| `typography.body.primary`   | `text-base`                                     |
| `typography.body.secondary` | `text-sm`                                       |
| `typography.caption`        | `text-xs`                                       |
| `typography.label`          | `text-sm` + `font-medium`                       |
| `typography.page.title`     | `text-2xl` / `text-3xl`                         |
| `typography.section.title`  | `text-lg` / `text-xl`                           |
| `typography.table.header`   | `text-xs` + `font-medium`                       |
| `typography.table.cell`     | `text-sm`                                       |
| `typography.kpi.value`      | `text-2xl` + `font-semibold`（可配 `tabular-nums`） |
| `typography.chat.message`   | `text-chat-message`（移动）/ `text-lg`（桌面）          |
| `typography.code.block`     | `text-code` + `font-mono`                       |

## 5. 组件级规则（MUST）

1. Button：默认使用 `text-base`（14px）；仅紧凑按钮（如行内微操作）使用 `text-sm`（13px）。
2. Input / Textarea：`value` 与 `placeholder` 保持同字号（默认 `text-base`），层级通过颜色区分。
3. Table：表头使用 `text-xs`，表体主信息使用 `text-sm`，次级信息使用 `text-xs`。
4. Chat Message：聊天消息正文必须使用语义类 `typography-chat-message`。
5. Numeric：监控指标、金额、Token 用量等数字字段应开启 `tabular-nums`。
6. Code Block：代码块必须使用 `font-mono`，字号使用 `text-code`（或 `text-sm` 兜底）。

## 6. 表单场景规则（MUST）

1. 高密度筛选条 / 列表内紧凑表单：`Label` 使用 `text-sm + font-medium`。
2. Drawer / Wizard / 长表单：`Label` 可提升到 `text-base + font-medium`，与输入值同级。
3. 同一表单区内字号档位不超过 2 档（例如只使用 13 与 14）。

## 7. AI 与 Markdown 场景规则（MUST）

1. AI 聊天容器内的标题需局部缩放，禁止直接映射全局 `text-3xl`：
   - `h1 -> text-xl`
   - `h2 -> text-lg`
   - `h3 -> text-base`
2. 聊天正文段落、列表默认使用 `typography.chat.message`。
3. 代码片段（inline / block）使用 `typography.code.block`。
4. 流式输出（Streaming）光标高度必须与当前行高一致，避免抖动与跳行。

## 8. 使用边界（MUST）

1. 禁止在业务代码中直接写 `text-[11px]`、`text-[13px]`、`text-[14px]` 等硬编码字号。
2. `text-2xs`（11px）禁止用于中文正文、关键元数据与可交互主文案。
3. `text-2xs` 仅可用于全大写英文缩写、状态角标数字、时间戳尾注。
4. 禁止通过输入前后字号变化表达状态（例如 placeholder 13px -> value 14px）。
5. 禁止同一操作域混用超过 3 档字号（例如一个表单区内同时出现 12/13/14/16）。

## 9. 响应式与场景策略

1. 控制台页面：坚持 `14px` 基线，不对正文做移动端降级。
2. AI 阅读场景：优先提高长文本耐读性，使用 `typography-chat-message`。
3. 营销页 / 展示页：可使用更大标题档位，但正文仍建议从 `14px` 起步。

## 10. 工程约束与落地

1. Token 必须统一定义在 `packages/theme-system/styles/theme.css`。
2. 语义类统一定义在 `packages/theme-system/styles/base.css`。
3. 建议在 lint / review 流程中增加“禁止硬编码字号”的检查。
4. PR 描述需说明是否影响：按钮、输入框、表格、AI 聊天阅读区。

## 11. 实施与验收清单

1. 新增组件前，先确定语义角色再选 token，不反向“看到像素再映射语义”。
2. PR 自检必须包含桌面与移动端截图对比（正文、表格、输入、按钮、聊天）。
3. 低分屏可读性检查：确保中文最小字号不低于 12px。
4. AI 聊天页面检查：消息正文移动端 15px、桌面端 16px，Markdown 标题层级无失控。
5. 关键数据检查：指标类数字已启用 `tabular-nums`。
6. 代码块检查：已使用 `font-mono`，字号符合 `text-code` 约束。

## 12. 参考实现（当前仓库）

- 字号 token：`packages/theme-system/styles/theme.css`
- 全局正文与聊天语义类：`packages/theme-system/styles/base.css`
- Button 默认字号策略：`packages/ui/button.tsx`
- Input 同字号策略：`packages/ui/input.tsx`
- AI 聊天应用示例：`apps/infera/src/features/project/services/components/service-detail/playground.tsx`
