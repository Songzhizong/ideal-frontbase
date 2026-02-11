## Enterprise SaaS Design Language (SDL) Prompt v1.0

### 1) 目标

生成适配各类企业 SaaS 的 UI：信息密度可控、可扫读、可操作、可治理（权限/审计/安全）、可演进（主题/密度切换不改结构）。

#### 默认视觉基调（项目级规范可覆盖）

- **风格**：现代、克制、专业 — 清晰的层级对比与充足的留白
- **色彩策略**：浅灰画布 + 白底卡片 + 功能色点缀，避免大面积浓烈色块
- **圆角与阴影**：统一柔和圆角（`rounded-xl`）+ 微妙阴影（`shadow-sm`），营造轻盈层次
- **动效原则**：仅在状态反馈时使用，持续时间 150-300ms，尊重 `prefers-reduced-motion`

### 2) 硬规则（MUST）

1. **语义优先**：所有视觉样式必须通过 **token key** 或组件默认值表达；禁止硬编码颜色/字号/间距/阴影/圆角等具体数值（除非工程白名单允许）。
2. **组件优先**：页面只能由已登记组件组合；需要新组件必须先补齐组件 SDL（见第 7 节）。
3. **结构稳定**：主题切换、密度切换仅替换 token/variant，不改变信息架构与层级结构。
4. **主次操作约束**：每页最多 1 个 Primary Action（其余 secondary/overflow）；卡片头部可见动作 ≤ 2（其余收纳）。
5. **可访问性**：所有可交互控件必须可键盘操作，并具备 aria-label/tooltip；不可用状态需可解释（权限/条件原因）。
6. **危险操作强制模式**：删除/禁用/回滚/密钥轮换等必须使用 ConfirmDangerPattern（第 6 节）。
7. **审计可追溯**：关键变更必须在活动流/审计日志可回溯（能定位操作者、时间、对象、结果）。

### 3) Token 使用契约（不含具体取值）

- **语义 Token（首选）**：
  - `surface.*`（背景/卡片/弹层）、`text.*`（文字）、`border.*`
  - `color.semantic.*`（success/warning/danger/info/neutral）、`color.state.*`（hover/focus/disabled）
  - `space.*`、`layout.*`（网格/页边距/区块间距）
  - `radius.*`、`shadow.*`、`motion.*`
  - `typography.*` + `numeric.tabular`（数字对齐）
  - `density.*`（影响行高/间距/表格密度）

- **原生 Tailwind 工具类（允许但需克制）**：
  - 仅在语义 Token 无法满足的富交互/数据可视化场景允许使用 `blue-500`, `amber-600` 等标准色板。
  - **Light/Dark 适配**：必须确保 Light/Dark 模式下的对比度（如：Light 模式禁用 `bg-white/10`，应使用 `bg-white/80` 或 `bg-background/80`）。

> 硬编码禁令与基础样式约束见 `general_rule.md` §2，此处不重复。

### 4) 页面结构模板（SHOULD）

顶层结构固定：
`AppShell -> (SideNav?) -> PageHeader -> ContentSections -> (Toast/Modal/Drawer)`
常见页面类型：`Dashboard | List/Table | Detail | Form(Edit/Create) | Settings | Wizard | Security | Audit`

### 5) 标准组件清单（可用组件）

**导航/结构**

- `AppShell` `SideNav` `Breadcrumbs` `PageHeader` `Section` `Card`

**数据展示**

- `StatCard` `Badge` `Progress/Meter` `Table/DataGrid` `List` `ActivityFeed` `EmptyState` `Skeleton`

**输入/操作**

- `Button` `IconButton` `FormField` `Input` `Select` `MultiSelect` `DateRange` `Search`
- `FilterBar` `SavedViews` `BulkActions` `Tabs` `Stepper/Wizard`

**反馈/系统**

- `Toast` `Alert/Banner` `Modal` `Drawer`
- 安全/审计：`SessionCard` `AuditLogTable`

> 组件输出必须描述：`component + props + (tokens 可选) + children`；不允许出现未登记组件名。

### 6) 关键模式（Patterns）

**ConfirmDangerPattern（MUST）**

- 必含：后果说明、受影响对象、可撤销性说明（不可撤销必须显式提示）
- 二次确认至少一种：输入确认词 / 勾选理解后果 / 倒计时
- 执行后：toast 反馈 + 审计记录入口

**权限可见性（MUST）**

- 组件支持 `visibilityRule`：无权限时隐藏或禁用；禁用必须解释原因
- 权限变更必须展示变更摘要与影响范围，并落审计

**列表页（SHOULD）**

- `Search + FilterBar + (SavedViews)`；选择行后出现 `BulkActions`
- 行内可见操作 ≤ 2，其余放 overflow

**表单（MUST）**

- 字段级校验 + 提交校验；长表单按 Section 分组；离开未保存提醒（适用时）
- 禁止仅靠颜色表达错误，必须有文案/图标/结构提示

**审计/日志（MUST）**

- 最少列：时间、操作者、动作、对象、结果（可选：来源/IP/客户端）
- 必备：时间范围过滤；导出能力受权限控制

### 7) 新组件约束

新增组件必须复用现有语义 Token、遵循 a11y 规范（aria-label/keyboard）、提供 variant 支持，并继承全局 `themeRef` 与 `density` 行为。

### 8) Visual Quality & Interaction Standards (MUST)

**Icons & Assets**

- **No Emojis**: 严禁使用 Emoji 作为 UI 图标（❌ `🚀` ✅ `<Rocket className="size-4" />`）。
- **Vector Only**: 使用 Lucide React 或 SVG 图标；保持 `stroke-width` 一致。
- **Fixed Size**: 图标必须指定明确尺寸（如 `size-4`, `size-5`），禁止依赖行高撑开。

**Interaction & Feedback**

- **Cursor**: 所有可点击/交互元素必须有 `cursor-pointer`。
- **Transition**: 交互状态（Hover/Active）必须有平滑过渡（推荐 `transition-colors duration-200`）。
- **No Layout Shift**: Hover 状态禁止改变布局属性（width/height/margin），仅允许改变 color/opacity/transform/shadow。
- **Feedback**: 关键操作（复制/保存/删除）必须有 Toast 或状态反馈。

**Typography & Content**

- **Tabular Nums**: 表格数字、统计卡片数字必须使用 `tabular-nums` 以对齐。
- **Truncation**: 文本溢出必须处理（truncate + tooltip）。

### 9) Pre-Delivery Checklist (MUST)

交付代码前必须自查：

1. **Responsive**: 在 375px (Mobile), 768px (Tablet), 1024px+ (Desktop) 下布局正常，无横向滚动。
2. **Theme**: 切换 Light/Dark 模式，文字对比度足够，边框可见，背景无异常反白/反黑。
3. **Empty/Loading**: 数据为空有 EmptyState；加载中有 Skeleton（禁止出现空白闪烁）。
4. **Console**: 无相关 React Key Warning 或 Hydration Error。
