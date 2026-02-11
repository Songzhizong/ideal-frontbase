# 0. 设计目标与落地原则

## 0.1 目标

1. 覆盖 Infera 全功能：项目/成员、模型/版本/Tag、数据集版本、微调任务、评估（含对比与门禁）、推理服务（含修订/流量/回滚/监控/日志/Playground）、API Key、用量成本、配额预算告警、审计日志。
2. 让研发“拿到文档即可开工”：所有表格列、表单字段、校验规则、弹窗逻辑、权限 gating、空态/错误态都明确。

## 0.2 核心交互原则

- **不可变 ID 优先显示与可复制**：`model_version_id / dataset_version_id / service_revision_id` 在所有关键页面必须可见（至少缩写 + Copy），用于可追溯。
- **Tag 只作快捷入口**：选择 Tag 时必须展示“解析后的 version_id”并写入确认页。
- **写操作必可审计**：所有写操作提交前必须有 Review（或至少确认弹窗），并在成功 toast 中提供“查看审计记录”入口。
- **生产环境更严格**：Prod 项目/服务在 UI 上有额外限制与提示（例如 Scale-to-Zero 可能被禁用、日志权限更严、Playground 记录默认关闭）。
- **依赖检查强提示**：删除模型版本/数据集版本/服务等遇到 `409 resource_in_use` 必须弹出依赖列表并提供跳转。

------

# 1. 全局信息架构与路由

## 1.1 双控制台结构

建议在前端信息架构上拆成两套入口（同一代码仓也可）：

1. **Tenant Console（租户控制台）**：企业/开发者使用，绝大多数功能在这里。
2. **Platform Console（平台运营控制台）**：仅平台管理员可见，用于系统模型与跨租户管理（按你文档“平台层级”）。

## 1.2 路由约定（可落地）

- 身份与工作区：
  - `/login`
  - `/workspace`（选择 Tenant / Project；若只有一个可自动跳转）
- 租户级（不带项目）：
  - `/t/:tenantId/overview`
  - `/t/:tenantId/projects`
  - `/t/:tenantId/users`
  - `/t/:tenantId/billing`（财务）
  - `/t/:tenantId/quotas-budgets`
  - `/t/:tenantId/alerts`
  - `/t/:tenantId/audit`
- 项目级（核心工作区）：
  - `/t/:tenantId/p/:projectId/dashboard`
  - `/t/:tenantId/p/:projectId/models`
  - `/t/:tenantId/p/:projectId/models/:modelId`
  - `/t/:tenantId/p/:projectId/datasets`
  - `/t/:tenantId/p/:projectId/datasets/:datasetId`
  - `/t/:tenantId/p/:projectId/fine-tuning`
  - `/t/:tenantId/p/:projectId/fine-tuning/:jobId`
  - `/t/:tenantId/p/:projectId/evaluation`
  - `/t/:tenantId/p/:projectId/evaluation/:evalRunId`
  - `/t/:tenantId/p/:projectId/services`
  - `/t/:tenantId/p/:projectId/services/:serviceId`
  - `/t/:tenantId/p/:projectId/api-keys`
  - `/t/:tenantId/p/:projectId/api-keys/:apiKeyId`
  - `/t/:tenantId/p/:projectId/usage`
  - `/t/:tenantId/p/:projectId/settings`（项目设置：成员/服务账号/配额预算等）
  - `/t/:tenantId/p/:projectId/audit`（项目审计）
- 平台控制台（可选）：
  - `/platform/tenants`
  - `/platform/system-models`
  - `/platform/audit`

------

# 2. 全局布局与通用组件规范

## 2.1 应用框架布局

**Topbar（顶栏）**

- 左侧：Logo + 当前 Tenant/Project 切换器（Workspace Switcher）
- 中间：面包屑 Breadcrumb（如：项目 / 推理服务 / serviceA）
- 右侧：全局搜索（Cmd+K）、通知铃铛、帮助/文档、用户菜单（Profile/Logout）

**Sidebar（左侧导航）**

- 项目维度导航（进入项目后）：
  - Dashboard
  - Models
  - Datasets
  - Fine-tuning
  - Evaluation
  - Inference Services
  - API Keys
  - Usage & Cost
  - Settings（Members / Service Accounts / Quota & Budget）
  - Audit Logs
- 租户维度导航（未选项目或进入租户级）：
  - Overview
  - Projects
  - Users
  - Billing（Finance 可见）
  - Quotas & Budgets
  - Alerts
  - Audit Logs

**Content（内容区）**

- 页面头：标题 + 描述 + 主按钮（Primary action）+ 次按钮（Secondary）
- Tabs（若模块复杂）：如模型详情/服务详情等
- 主体：表格 / 表单 / 图表 / 日志等

## 2.2 通用组件清单（必须统一封装）

1. **DataTable（服务端分页）**
   - 功能：排序、筛选、分页、列显隐、行选择、批量操作、导出（CSV/JSON）
2. **IDBadge + Copy**
   - 对所有不可变 ID / hash：显示短 ID（前 8-12 位）+ Copy + “查看完整”popover
3. **StatusBadge**
   - 支持枚举：Pending / Downloading / Starting / Ready / Inactive / Failed 等
4. **TagChips**
   - Model Tag（latest/prod/staging）显示为 chip，可点击跳转到版本
5. **DiffViewer（before/after JSON）**
   - 审计详情、修订变更对比
6. **LogViewer**
   - 时间范围、关键字、级别、实例、修订过滤；支持 streaming；支持下载
7. **MetricsPanel**
   - 时间范围选择（1h/6h/24h/7d/自定义）+ 指标卡片 + 多图表
8. **Wizard（多步向导）**
   - 微调任务创建、服务创建/部署等
9. **EmptyState / ErrorState**
   - 空态要有 CTA；错误态要有重试与错误详情（可展开）
10. **PermissionGuard**

- 用于按钮/入口级别的显示与禁用（同时给出原因 tooltip）

------

# 3. 权限与可见性设计（前端 gating 规则）

## 3.1 权限维度

- **租户角色**：Tenant Admin / Member / Finance
- **项目角色**：Owner / Developer / Viewer
- **主体类型**：user / service_account
- **环境标签**：Dev/Test/Prod（Prod 更严格策略）

## 3.2 前端落地规则

1. **导航入口级控制**：无权的模块在 Sidebar 隐藏；如需“可见但只读”，则显示但锁 icon + tooltip。
2. **页面内操作级控制**：同一页面不同按钮按角色禁用或隐藏（推荐禁用并提示原因，减少“看不到功能”的困惑）。
3. **数据级脱敏**（Finance 角色）：
   - Billing/Usage 可看聚合数据
   - 不可查看模型内容、数据集内容、Playground 对话内容、日志内容（可按你商业策略调整）
4. **Prod 环境策略提示**（即使后端也会限制，前端仍应提示）：
   - Scale-to-Zero 可能被禁用
   - Playground 默认不记录 prompt/response
   - 日志查看可能仅 Owner/Developer 可见

------

# 4. 页面设计详规（按模块）

下面每个模块都包含：**页面结构、表格列/筛选、表单字段/校验、弹窗/抽屉、状态**。

------

## 4.1 登录与工作区选择

### 4.1.1 登录页 `/login`

**布局**

- 左：产品介绍/卖点（可选）
- 右：登录卡片

**表单字段**

- Email（必填，邮箱格式校验）
- Password（必填）
- 登录按钮（Loading 状态）
- 可选：SSO 登录入口（按钮 + 组织域名输入）
- 错误提示：账号不存在/密码错误/账号禁用（统一错误文案避免信息泄露）

**状态**

- 登录成功：跳转 `/workspace`

### 4.1.2 工作区选择 `/workspace`

**目的**：选择进入哪个 Tenant 与 Project。

**模块**

- Tenant 列表卡片（若只有一个 tenant 自动进入）
- 选中 Tenant 后展示项目列表（可搜索/按 env 过滤）
- “进入项目”按钮

**项目卡信息**

- 项目名、env Badge、最近访问时间、服务数/本月消耗（可选）

------

## 4.2 租户级：Overview / Projects / Users / Billing / Quotas / Alerts / Audit

### 4.2.1 租户概览 `/t/:tenantId/overview`

**权限**：Tenant Admin / Finance / Member（可只看基础）

**顶部指标卡**

- 账户余额（如有）
- 本月预估成本
- 今日 tokens
- 活跃项目数
- 活跃服务数
- 告警数（未处理）

**下方区块**

1. 成本趋势（7/30 天）
2. 项目成本 Top 5（表格）
3. 最近审计事件（列表，点击进入 audit）

------

### 4.2.2 项目列表 `/t/:tenantId/projects`

**权限**

- 查看：所有租户成员可看（但 Member 仅看自己有权限的项目）
- 创建/删除：Tenant Admin；Member 是否可创建由配置决定（UI 读取后端 `can_create_project`）

**表格（DataTable）**

- 列：
  - 项目名
  - env（Dev/Test/Prod）
  - Owner（项目拥有人）
  - 服务数（Ready/Total）
  - 本月成本（估算）
  - 今日 tokens
  - 更新时间
  - 操作（进入、设置、删除）
- 筛选：
  - env
  - Owner
  - 成本范围
  - 关键字（项目名/ID）

**主按钮**

- “创建项目”（打开弹窗）

#### 创建项目弹窗（Dialog）

字段：

- 项目名称（必填，2-64 字符）
- 环境标签 env（必选：Dev/Test/Prod）
- 描述（可选，0-200）
- 项目配额策略（可选：使用租户默认/自定义 → 打开高级设置）
- 初始成员（可选：选择租户用户 + 项目角色）

校验：

- 名称唯一（前端即时校验 + 提交校验）
- Prod 项目：提示“默认更严格策略会生效”

成功后：

- toast：创建成功 + “进入项目”按钮

#### 删除项目（Danger Confirm）

- 必须输入项目名确认
- 如果存在资源（服务/Key/任务等）：提示“删除将级联删除/或禁止删除（按后端策略）”，并给出资源清单链接（至少服务/Key/模型引用）

------

### 4.2.3 租户用户与邀请 `/t/:tenantId/users`

**权限**：Tenant Admin 管理；Finance/Member 只读或不可见（建议只读）

**Tabs**

- Users（用户）
- Invitations（邀请记录）

**Users 表格列**

- 姓名（如无则显示邮箱前缀）
- Email
- 租户角色（Tenant Admin/Member/Finance）
- 状态（Active/Invited/Disabled）
- 最近登录时间
- 创建时间
- 操作：编辑角色、禁用/启用、重发邀请

**邀请用户弹窗**
 字段：

- Email（可批量输入，支持逗号/换行）
- 租户角色（默认 Member）
- 分配项目（可选：选择项目 + 角色）
- 发送邀请按钮

校验：

- 邮箱格式、重复邮箱去重
- 若给 Finance：提示其权限限制（不可看模型/数据内容）

------

### 4.2.4 账单与发票 `/t/:tenantId/billing`

**权限**：Finance + Tenant Admin

**Tabs**

- Usage & Cost（租户总览）
- Invoices（发票/账单）
- Payment Methods（支付方式，若有）
- Cost Allocation（成本分摊：按项目/Key/服务）

**Invoices 表格**

- 账期
- 金额
- 状态（Paid/Unpaid/Overdue）
- 下载发票（按钮）
- 明细（进入账期详情）

**账期详情**

- 成本构成（tokens / GPU-hours 估算等）
- 可导出 CSV

------

### 4.2.5 租户配额与预算 `/t/:tenantId/quotas-budgets`

**权限**：Tenant Admin；Finance 仅预算可编辑（按你矩阵）

**Tabs**

- Quotas（配额）
- Budgets（预算）
- Policy History（变更历史，来自审计）

**Quotas 表单（结构化 + JSON 高级）**
 推荐两种模式：

- 简单模式（推荐）：常用字段
- 高级模式：JSON 编辑器（只对管理员开放）

简单模式字段建议：

- 最大项目数（可选）
- 最大服务数（可选）
- 每日 tokens 上限（可选）
- 并发请求上限（可选）
- GPU 资源池配额（可选：按型号/数量）

**Budgets 表单**

- 日预算（金额）
- 月预算（金额）
- 告警阈值（多选或可增删：如 50%/80%/100%）
- 超限动作：
  - Alert only（仅告警）
  - Block inference（阻断推理调用/或阻断创建新服务，按后端策略）
- 通知渠道：
  - Email（默认租户管理员）
  - Webhook（可选：URL + Secret）

提交确认：

- Review 弹窗展示 before/after 摘要（尤其预算动作）

------

### 4.2.6 告警中心 `/t/:tenantId/alerts`

**权限**：Tenant Admin（管理）/ Member（只看自己项目）/ Finance（只看成本告警）

**Tabs**

- Active Alerts（当前告警）
- Alert Rules（规则）
- History（历史）

**Active Alerts 列表**

- 严重级别（S1/S2/S3）
- 类型（成本/错误率/延迟/Pending 超时/冷启动异常）
- 范围（租户/项目/服务）
- 触发时间
- 当前值 vs 阈值
- 状态（Open/Ack/Resolved）
- 操作：查看详情、Ack、跳转到相关资源

**Alert Rules 表格**

- 规则名
- 类型
- 作用范围（全部项目/指定项目/指定服务）
- 条件（阈值 + 持续时间）
- 通知渠道
- 是否启用
- 操作：编辑/禁用/删除

**创建/编辑告警规则（Sheet 抽屉更合适）**
 字段：

- 规则名（必填）
- 类型（必选）
- 范围：
  - 全租户
  - 指定项目（多选）
  - 指定服务（多选，需要先选项目）
- 指标与条件：
  - 成本：日/月花费、增长率
  - 错误率：5xx 比例、4xx 比例
  - 延迟：P95/P99 > X ms
  - Pending 超时：Pending > X 分钟
  - 冷启动：cold_start_count 或 cold_start_latency > X
- 持续时间（如连续 5 分钟）
- 通知渠道（Email/Webhook）
- 超限动作（仅成本类可配置 block/alert）

------

### 4.2.7 租户审计日志 `/t/:tenantId/audit`

**权限**：Tenant Admin / Finance（只读）
 **表格列**

- 时间
- Actor（user/service_account）
- Action（如 tenant.quota.update）
- Resource（type + id）
- Project（可为空）
- IP
- User-Agent（折叠显示）
- 操作：查看详情（Drawer）

**筛选**

- 时间范围
- Actor 类型/邮箱
- Action
- Resource type
- Project

**审计详情 Drawer**

- 基本信息（actor、ip、ua、时间）
- Resource 信息（type/id 可复制）
- Before JSON（折叠）
- After JSON（折叠）
- Diff 高亮视图（默认打开）

------

## 4.3 项目级：Dashboard / Models / Datasets / Fine-tuning / Evaluation / Services / Keys / Usage / Settings / Audit

------

## 4.3.1 项目看板 `/t/:tenantId/p/:projectId/dashboard`

**权限**：Owner/Developer/Viewer（都可见）

**顶部概览**

- 运行服务数（Ready/Total）
- 模型数（可用模型资产/版本数）
- 本月成本（估算）
- 今日 tokens
- 错误率（近 1h/24h 可切换）

**中部**

- 最近部署（服务名、revision、操作者、时间、结果）
- 活跃告警（可直接 Ack/跳转）
- 最近审计事件（项目级）

**交互**

- 时间范围切换：1h/24h/7d
- 卡片点击跳转到对应模块（服务/用量/审计）

------

## 4.3.2 项目设置 `/t/:tenantId/p/:projectId/settings`

建议 Tabs：

1. Overview
2. Members
3. Service Accounts
4. Quotas & Budgets
5. Environment Policies（可选，Prod 限制开关）
6. Danger Zone

### A) Overview

- 项目名称、env、描述（可编辑：Owner）
- 项目 ID（可复制）
- 创建时间、创建人

### B) Members（成员管理）

**表格列**

- 用户
- Email
- 项目角色（Owner/Developer/Viewer）
- 加入时间
- 操作：修改角色、移除

**添加成员弹窗**
 字段：

- 从租户用户选择（支持搜索）
- 项目角色（必选）
- 备注（可选）

校验：

- 不允许移除最后一个 Owner（前端提示 + 后端兜底）

### C) Service Accounts

**表格列**

- 名称
- 绑定角色（Owner/Developer/Viewer 的子集，建议默认 Developer）
- 状态（Active/Disabled）
- 最后使用时间
- 创建时间
- 操作：生成/轮换 token、禁用、删除

**创建服务账号（Dialog）**

- 名称（必填）
- 角色（必选）
- 备注（可选）

**生成/轮换 Token（Dialog）**

- 确认后生成 token
- token 明文仅展示一次：显示框 + Copy + “我已保存”checkbox
- 可选：同时禁用旧 token（toggle）

### D) Quotas & Budgets（项目级）

与租户类似，但强调“覆盖租户默认”。

- 显示：租户默认策略（只读）
- 项目策略：继承/覆盖（toggle）
- 覆盖字段（同租户）
- 保存前 Review

### E) Environment Policies（可选）

用于实现你文档中“Prod 默认更严格策略”：

- Prod 禁止 Scale-to-Zero（toggle，默认开）
- Prod 强制启用告警（toggle，默认开）
- Prod 禁止 Playground 记录内容（toggle，默认开）
- Viewer 禁止看日志（toggle，默认开）

### F) Danger Zone

- 删除项目（同租户级删除规则，但更聚焦项目内资源）

------

## 4.3.3 模型库 `/t/:tenantId/p/:projectId/models`

### 页面结构

**Tabs**

- Available Models（项目可用：系统 + 私有 + 共享）
- System Models（仅浏览系统模型库）
- Tenant Models（租户私有/共享资产）

> 推荐默认落在 “Available Models”，减少用户理解成本。

### Available Models：表格

**列**

- Model Name
- 来源（System / Tenant / Project）
- Visibility（Private/TenantShared/Public）
- Tags（latest/prod/staging）
- Latest Version（短 ID + Copy）
- 参数量/ctx（来自 metadata，若无则显示 “—”）
- Used by Services（数量）
- 更新时间
- 操作：详情、部署、管理 Tag（若有权）、上传新版本（若为私有模型）

**筛选**

- 来源、visibility、license、format、artifact_type、quantization
- 关键字（name/version_id）

**主按钮**

- 上传模型（Owner/Developer）
- （可选）添加系统模型到项目（如果你后端需要显式 ref）

------

### 模型详情 `/models/:modelId`

**Header**

- 模型名 + 来源/visibility Badge
- Tags 快捷 chips（latest/prod/staging）
- 主操作：
  - 部署为服务（Owner/Developer）
  - 上传新版本（Owner/Developer，仅私有模型）
  - 管理 Tags（Owner，Developer 可配置）
  - 删除模型（Owner，需依赖检查）

**Tabs**

1. Overview
2. Versions
3. Tags
4. Usage（被哪些服务/修订引用）
5. Audit

#### Overview

- Model ID（copy）
- owner_type / owner_id
- visibility
- 描述（可选字段）
- 最近版本摘要（最新 3 个 version）

#### Versions（版本表格）

列：

- model_version_id（短+copy）
- artifact_type（Full/Adapter/Merged）
- format（safetensors/gguf/bin）
- sha256（短+copy）
- size
- source（Upload/Fine-tune/System）
- base_model_version_id（若有）
- created_at
- 引用数（Service Revisions count）
- 操作：
  - 查看详情
  - 部署此版本
  - 关联/更新 Tag（有权）
  - 删除版本（有权 + 未被引用）

筛选：

- artifact_type / format / source
- 是否被引用

#### Version 详情（建议 Drawer 或独立页）

内容：

- 基本信息（所有字段 + copy）
- Metadata JSON（可折叠）
- 来源关联：
  - source_job_id（若来自微调）
  - base_model_version_id
- 引用列表（Service Revision 表格）
- 操作：删除（若允许）

#### Tags 管理

表格列：

- tag_name
- points_to model_version_id（copy）
- updated_by
- updated_at
- 操作：
  - Promote（选择新的 version）
  - Rollback（从历史选择）
  - 删除 Tag（可选）

**Promote Tag 流程（Dialog + Gate 检查）**

- 选择目标 model_version_id（必选）
- 显示：当前指向版本 vs 目标版本
- Gate 校验结果（如果该 tag=prod 且要求门禁）：
  - 通过：允许继续
  - 不通过：禁止提交，并展示失败指标与链接到 Evaluation 报告
  - Owner 可选“强制 promote（需要二次确认 + 理由输入）”（是否需要看你策略）
- 提交成功：toast + “查看审计记录”

#### 删除版本/模型（依赖检查）

- 若后端返回 `409 resource_in_use`：
  - 弹窗显示依赖表格：service_name / revision_id / env / traffic_weight / endpoint
  - 提供一键跳转到对应服务/修订

------

### 上传模型（Wizard）

入口：Models 页面主按钮“上传模型”

**Step 1：选择目标**

- 新建模型 / 现有模型新增版本
- 模型名（新建必填）
- visibility（Private/TenantShared/Public，若允许）
- 描述（可选）

**Step 2：上传方式**

- Web Upload（拖拽上传）
- CLI Upload（展示指引文案 + “已完成上传”按钮，后端轮询状态）
- 文件格式选择（safetensors/gguf/bin，必选或自动识别）

**Step 3：版本信息**

- artifact_type（Full/Adapter/Merged）
- base_model_version_id（可选：用于微调产物或衍生）
- metadata（结构化字段 + JSON 高级）
  - 参数量、ctx、license、quantization、notes
- 提示：上传完成将生成 sha256

**Step 4：确认**

- 展示解析结果：sha256、size、format、model_version_id（预生成或提交后返回）
- 提交

**状态**

- 上传进度条
- 失败错误（网络/格式不支持/校验失败）+ 重试

------

## 4.3.4 数据集 `/t/:tenantId/p/:projectId/datasets`

### 数据集列表

**表格列**

- 数据集名
- Latest dataset_version_id（短+copy）
- 行数 rows（latest）
- Token 统计（prompt/total，若有）
- schema 摘要（字段数）
- used_by（微调任务数、评估次数）
- 更新时间
- 操作：详情、上传新版本、删除（依赖检查）

筛选：

- 关键字、是否被使用、行数范围

主按钮：

- 上传数据集版本

### 数据集详情 `/datasets/:datasetId`

**Header**

- 数据集名 + dataset_id copy
- 主操作：上传新版本、删除数据集

**Tabs**

1. Versions
2. Preview（可选）
3. Usage
4. Audit

#### Versions 表格

列：

- dataset_version_id（copy）
- sha256（copy）
- rows
- schema（点击查看 JSON）
- token_stats（点击查看详情）
- created_at
- used_by（jobs/evals）
- 操作：查看详情、删除版本（未被使用）

#### Version 详情（Drawer）

- 全字段展示 + copy
- schema JSON viewer
- token_stats（指标卡：prompt_tokens/total_tokens/平均每行 tokens 等）
- 存储 URI（若允许展示）
- 使用列表（关联 job/eval）

### 上传数据集版本（Wizard）

**Step 1：选择数据集**

- 新建数据集 / 选择已有
- 数据集名（新建必填）

**Step 2：上传文件**

- JSONL 上传（拖拽）
- （可选）支持多文件合并
- 基础校验：
  - 文件大小上限
  - JSONL 每行合法 JSON
  - 必填字段存在（若有 schema 约定，可后端返回）

**Step 3：解析与统计**

- 显示：
  - rows
  - schema 推断（字段列表）
  - token 统计（如果后端支持预计算；否则显示“计算中”并可稍后查看）
- 错误行展示（最多 20 条）+ 下载错误报告（可选）

**Step 4：确认提交**

- 展示 dataset_version_id（提交后返回）
- 完成后跳转版本详情

------

## 4.3.5 微调任务 `/t/:tenantId/p/:projectId/fine-tuning`

### 任务列表

**表格列**

- job_id（短+copy）
- 任务名（可选字段）
- base_model_version_id（copy）
- dataset_version_id（copy）
- 方法（LoRA/Full）
- 资源规格（GPU 型号 x 数量）
- 状态（Queued/Running/Succeeded/Failed/Canceled）
- 进度（% 或 step/epoch）
- 预估成本（如有）
- 创建时间 / 创建人
- 操作：详情、取消、重试、克隆配置

筛选：

- 状态、方法、创建人、时间范围

主按钮：

- 创建微调任务（Owner/Developer）

### 创建微调任务（Wizard）

**Step 1：选择基座模型**

- 选择模型（可通过 Tag 或直接选 version）
  - 选择 Tag 时：必须展示“解析后 base_model_version_id”
- 展示模型 metadata（参数量、ctx、license、quantization）
- 输出模型命名：
  - 输出模型名（新建模型资产）或选择已有模型作为“新增版本”
  - 输出 artifact_type（Full/Adapter/Merged，通常 LoRA=Adapter）

校验：

- 必须选择 base_model_version_id（最终不可为空）

**Step 2：选择训练数据**

- 选择 dataset + dataset_version_id
- 展示：rows、schema、token_stats
- 校验与风险提示：
  - tokenizer mismatch 风险提示（若后端能检测，显示具体项）
  - schema 不一致提示

**Step 3：训练配置**
 字段（默认值建议给出）：

- Training type：LoRA / Full（必选）
- Epochs（必填，正整数，建议 1-20）
- Batch Size（必填，正整数）
- Learning Rate（必填，浮点范围校验，如 1e-6 ~ 1e-2）
- Advanced（折叠）：
  - gradient accumulation
  - warmup steps
  - weight decay
  - LoRA 参数（r/alpha/dropout）（仅 LoRA 时显示）
- 校验：
  - 数值范围提示
  - 不合法组合提示（如 batch 太大可能 OOM）

**Step 4：计算资源与成本预估**

- GPU 规格选择（下拉：8xA100 80G 等）
- 资源池（若有）
- 预估 GPU-hours（只读显示）
- 预估费用区间（只读）
- 提示：这只是估算
- 可选：设置本次任务预算上限（金额/或 GPU-hours，上限由后端支持）

**Step 5：确认提交**

- Summary 卡片：
  - base_model_version_id
  - dataset_version_id
  - 超参
  - 资源规格
  - 预估成本
- 提交按钮

### 任务详情 `/fine-tuning/:jobId`

**Header**

- 任务名/ID + 状态 Badge
- 操作：
  - 取消（Queued/Running）
  - 重试（Failed）
  - 克隆（任意状态）
  - 查看产出模型版本（Succeeded 时）

**Tabs**

1. Overview
2. Metrics
3. Logs
4. Artifacts
5. Audit

#### Overview

- 配置信息（只读 Summary）
- 数据集与基座模型链接
- 时间线（Queued → Running → ...）
- 若 Failed：
  - status_reason 分类（OOM/数据格式/tokenizer mismatch/下载失败/镜像拉取失败…）
  - 建议操作（对应文案 + “查看日志定位”按钮）

#### Metrics

- Loss 曲线（折线图）
- 可选：学习率曲线
- 时间范围/step 范围过滤

#### Logs

- LogViewer（实时流 + 分页）
- 支持关键字搜索、下载
- 错误行高亮（可选）

#### Artifacts

- 产物列表（JOB_ARTIFACT）
  - artifact_type
  - output model_version_id（copy）
  - storage uri（若允许）
- 主操作：
  - “注册 Tag”（跳到模型 Tags 管理）
  - “部署为服务”
  - “发起评估”

------

## 4.3.6 模型评估 `/t/:tenantId/p/:projectId/evaluation`

### 评估列表

**表格列**

- eval_run_id（copy）
- 评估对象：model_version_id（copy）
- 测试集：dataset_version_id / benchmark 名称
- 指标摘要（Loss/Perplexity/Rouge-L…）
- 状态（Running/Succeeded/Failed）
- 结果（Pass/Fail 若有门禁）
- 创建时间/创建人
- 操作：查看报告、对比评估、重新运行

主按钮：

- 创建评估

### 创建评估（Wizard）

**Step 1：选择评估类型**

- 自动评估（单模型）
- 对比评估（双模型 Side-by-Side）
- 回归门禁评估（基于 regression prompts + 规则）

**Step 2：选择模型与数据**

- 模型：model_version_id（或选择 tag→解析后落版本）
- 数据：dataset_version_id 或 benchmark（下拉）
- 指标选择（多选）

**Step 3：配置与确认**

- 运行参数（可选）
- 确认 Summary

### 评估详情 `/evaluation/:evalRunId`

**Header**

- 状态 + Pass/Fail（若门禁）
- 操作：导出报告、重新运行、（若通过且有权限）Promote to prod tag

**Tabs**

1. Report
2. Side-by-Side（仅对比评估）
3. Gate（若门禁）
4. Audit

#### Report

- 指标卡：Loss/Perplexity/Rouge-L 等
- 指标明细表（按数据集分片或按样本聚合，视后端能力）
- 结论摘要（自动生成一句话可选）

#### Side-by-Side

- 同屏两列：
  - 左：版本 A（model_version_id / revision_id）
  - 右：版本 B
- 中间：Prompt 输入区 + 参数区（temperature/top_p/max_tokens）
- 输出对比：
  - 支持高亮差异（可选）
  - 支持人工评分（1-5）与备注
  - 支持标记 Winner

#### Gate

- 门禁规则展示（阈值、通过率）
- 本次结果 vs 阈值
- 未通过时：禁止 Promote，并给出“调整建议/重新评估”入口
- 通过时：显示“Promote to prod tag”按钮（跳转到模型 Tag Promote 弹窗，并自动带上该评估作为证据）

------

## 4.3.7 推理服务 `/t/:tenantId/p/:projectId/services`

### 服务列表

**表格列**

- 服务名
- env Badge
- current_state（Pending/Downloading/Starting/Ready/Inactive/Failed）
- desired_state（Active/Inactive）
- Endpoint URL（copy）
- 当前模型版本（model_version_id，copy）
- Runtime（vLLM/TGI/Triton/HF）
- Replicas（min-max，及当前运行数）
- 近 1h：QPS / P95 / 错误率
- 更新时间
- 操作：
  - 进入详情
  - 部署新 Revision
  - 编辑流量
  - 启停（切 desired_state）
  - 删除（Danger）

筛选：

- env、状态、runtime、模型、是否 Inactive、错误率范围

主按钮：

- 创建服务（Owner/Developer）

------

### 创建服务（Wizard）

**Step 1：基础信息**

- 服务名称（必填，2-64，字母数字-，建议约束）
- 描述（可选）
- env（默认项目 env，可改）
- 网络暴露（Public/Private，必选）
- IP Allowlist（可选，支持 CIDR 多条；仅 Public 时显示）
- API 协议（只读显示 OpenAI-compatible）

**Step 2：选择模型**

- 选择模型资产
- 选择：
  - Tag（latest/prod/staging）或
  - 指定 model_version_id
- 必须展示：解析后的 `model_version_id`（最终落库）
- 显示模型 metadata 摘要

**Step 3：选择 Runtime**

- runtime 下拉：vLLM / TGI / NVIDIA Triton / HF Predictor
- 显示推荐说明：
  - vLLM：高并发推荐
  - Triton：多框架推理
- （可选）runtime 参数高级设置（折叠）

**Step 4：资源规格**

- GPU 型号（A10/A100…）
- GPU 数量
- CPU request/limit
- Memory request/limit
- 校验提示：
  - 与模型大小/量化不匹配风险
- 成本估算（只读卡片）

**Step 5：弹性伸缩**

- 指标类型（Concurrency / QPS）
- Min Replicas（整数，允许 0）
- Max Replicas（整数，>= Min）
- Scale-down Delay（秒/分钟）
- Scale-to-Zero（toggle）
  - 若 env=Prod 且策略禁止：禁用 toggle 并提示原因
  - 若开启：显示冷启动提示（30s–2min）
- 容量不足策略（只读说明，返回 429/503 等）

**Step 6：确认创建**

- Summary：所有关键字段 + version_id/revision 预览
- 提交

------

### 服务详情 `/services/:serviceId`

**Header（固定可见）**

- 服务名 + env + 状态 Badge
- Endpoint URL（copy）
- Desired State 开关（Active/Inactive）
- 快捷操作：
  - Deploy new revision
  - Edit traffic
  - Rollback
  - Open Playground
  - Delete（Danger）

**状态区（很关键）**

- current_state 可视化步骤条：
  - Pending → Downloading → Starting → Ready
- 每个状态显示：
  - 已持续时间（如 Pending 12m）
  - 解释文案
- 若 Pending 超时：
  - 显示“资源不足”可能原因（如 GPU 配额/资源池容量）
  - CTA：调整规格 / 换资源池 / 稍后重试

**Tabs**

1. Overview
2. Revisions & Traffic
3. Metrics
4. Logs
5. Playground
6. Settings
7. Audit

------

#### Tab 1：Overview

区块：

- 当前流量分配摘要（Revision A 90% / B 10%）
- 当前生效配置摘要（runtime、资源、autoscaling）
- 最近事件：
  - 部署成功/失败
  - 扩缩容事件（可选）
  - 冷启动事件计数（可选）

------

#### Tab 2：Revisions & Traffic

**A) Revision 列表表格**
 列：

- revision_id（copy）
- created_at / created_by
- model_version_id（copy）
- runtime
- image_digest（短+copy）
- resource_spec 摘要（GPU/CPU/Mem）
- autoscaling 摘要（min/max/metric）
- config_hash（copy）
- 状态（Ready/Failed）
- 流量权重（%）
- 操作：
  - 查看详情（Drawer）
  - 设置为 100%
  - 参与灰度（编辑权重）
  - 回滚到此 revision（本质是切流 100%）
  - 删除 revision（通常不建议，除非无流量且历史清理策略允许）

**B) 编辑流量（Traffic Editor）**
 表现形式：表格 + 权重输入框（或 slider），支持 2+ revisions
 规则：

- 权重总和必须 = 100
- 不能把所有流量给 Failed revision
- 应提供“自动归一化”按钮（将剩余权重均分/补齐）

提交前弹窗（Confirm）：

- 展示 before/after 流量对比
- 风险提示（灰度发布建议观察指标）

------

#### Deploy new revision（Wizard/Sheet）

入口：Header “Deploy new revision”

步骤：

1. 选择模型版本（可选 tag→解析）
2. runtime（默认沿用当前）
3. resources/autoscaling（默认沿用当前，可改）
4. Review：展示与当前 revision 的 Diff（很重要）
5. 发布策略选择：
   - 立即 100% 切流
   - 创建 revision 但不切流（0%）
   - 灰度发布（输入初始权重，如 10%）

------

#### 一键回滚（Rollback）

入口：Header “Rollback”

- 弹窗中选择目标历史 revision（列表显示：时间、版本、状态、曾经是否稳定）
- 确认后：切流 100% → toast → 跳转 Metrics 建议观察

------

#### Tab 3：Metrics（可观测）

**控制条**

- 时间范围选择（1h/6h/24h/7d/自定义）
- 粒度（自动/1m/5m/1h）
- 维度过滤：
  - 全部 revisions
  - 指定 revision
- 对比模式（可选）：选择两个 revision 叠加对比

**指标卡（顶部）**

- 成功率（2xx）
- P95 / P99 延迟
- TTFT / TPOT
- Tokens/sec
- GPU 利用率
- 显存占用
- 实时并发
- cold_start_count / cold_start_latency（必有，按你约束）

**图表区（建议至少 6 张）**

- QPS
- 延迟 P95/P99
- 成功率与错误率
- TTFT / TPOT
- Tokens/sec
- GPU Util / GPU Memory
- 冷启动次数与耗时

**交互**

- 图表 hover 展示数值
- 支持导出 CSV（当前筛选条件）与截图（可选）

------

#### Tab 4：Logs

**权限**：Prod 环境可按策略限制 Viewer

**LogViewer 功能**

- 过滤：
  - 时间范围
  - revision
  - instance（若可得）
  - level（info/warn/error）
- 搜索：关键字
- 操作：
  - 暂停/继续流式刷新
  - 下载（当前筛选）
  - 复制单行
- 若无权限：显示锁定状态 + 提示“该环境下日志仅对 Developer/Owner 开放”

------

#### Tab 5：Playground

**核心目标**：调试推理 API（OpenAI compatible）

**布局**

- 左侧：对话区（Chat）
- 右侧：参数区（可折叠）
  - model/revision 选择（默认当前 100% revision）
  - temperature、top_p、max_tokens、stop、presence_penalty 等（按后端支持）
  - stream 开关
  - 显示 token 用量（prompt/completion/total）
- 底部：Raw Request/Response（折叠）

**Prod 环境限制**

- “记录 Prompt/Response 内容”默认关闭（且可能禁用）
- 若禁用：显示合规提示文案

**高级**

- 同屏对比（可选）：
  - 选择第二个 revision → 发送同一 prompt → 两列输出对比
  - 可“一键创建对比评估（Evaluation）”入口（把 prompt 与输出提交给评估模块）

------

#### Tab 6：Settings

强调：**所有配置变更应生成新 Revision**，因此这里的“编辑”实际触发 Deploy new revision。

区块：

1. 基础信息（名称、描述）
2. 网络配置（Public/Private、IP allowlist）
3. Runtime & Resources（编辑→打开 Deploy new revision 并预填）
4. Autoscaling（同上）
5. 合规与留存（prompt/response 记录策略、保留期，占位）
6. Danger Zone：
   - 删除服务：输入服务名确认
   - 删除前提示：endpoint 将不可用、keys 仍可存在但无服务等

------

#### Tab 7：Audit

同项目审计，但默认过滤到该 service_id。

------

## 4.3.8 API Keys `/t/:tenantId/p/:projectId/api-keys`

### Key 列表

**表格列**

- key 名称（可选字段，建议必须）
- api_key_id（copy）
- scopes（chips：inference:invoke / metrics:read / logs:read …）
- RPM limit
- Daily token limit
- Expires at
- 状态（Active/Revoked/Expired）
- Last used（若有）
- 创建时间
- 操作：
  - 查看详情
  - 编辑限制/Scopes
  - 轮换（rotate）
  - 吊销（revoke）

筛选：

- 状态、scope、是否即将过期（7 天内）

主按钮：

- 创建 API Key（Owner/Developer）

### 创建 Key（Wizard 或 Dialog）

字段：

- 名称（必填，1-64）
- Scopes（多选，默认仅 `inference:invoke`）
- 过期时间（可选：日期选择器）
- RPM limit（必填或可选，正整数，支持“不限制”）
- Daily token limit（必填或可选，正整数，支持“不限制”）
- 备注（可选）

提交成功后：**Secret Key 展示弹窗（必须）**

- 显示明文 key（只此一次）
- Copy 按钮 + “下载为 .txt”（可选）
- checkbox：我已保存（未勾选不能关闭）
- 提示：若丢失需 rotate

### Key 详情页 `/api-keys/:apiKeyId`

**Tabs**

1. Overview
2. Usage（按该 key 聚合的 tokens/请求/错误）
3. Audit

**Overview**

- key_id copy
- scopes chips
- limits
- created/updated
- 状态（revoked_at、expires_at）

**Usage**

- 时间范围 + 图表（tokens、请求、延迟、状态码分布）
- 关联服务 Top（表格）

### Rotate Key 弹窗

- 选项：
  - 生成新 key 并立即吊销旧 key（默认）
  - 生成新 key，旧 key 保留（需要手动 revoke）（可选）
- 生成后同样只展示一次明文

### Revoke Key 弹窗

- Danger confirm（输入 key 名称或 “REVOKE”）
- 提示影响：调用将 401/403（按后端）

------

## 4.3.9 用量与成本 `/t/:tenantId/p/:projectId/usage`

### 页面结构

**顶部过滤条**

- 时间范围
- 维度 Group by：
  - Service
  - Revision
  - API Key
  - Model Version
  - Status Code
- 过滤：
  - service_id
  - revision_id
  - api_key_id
  - model_version_id
  - status_code（2xx/4xx/5xx）
- 粒度（小时/天）

**指标卡**

- prompt_tokens / completion_tokens / total_tokens
- 平均延迟 / P95
- 成功率
- 预估成本（解释 tooltip：估算模型）

**图表**

- tokens 趋势
- 成本趋势
- 请求数趋势
- 延迟趋势
- 状态码分布（柱状/饼图）

**聚合表格（随 Group by 变化）**
 通用列：

- 分组对象（service/revision/key/version）
- 请求数
- total_tokens
- 平均延迟 / P95
- 错误率
- 成本估算
- 操作：钻取（跳到服务详情 metrics 或 key 详情 usage）

**导出**

- 导出 CSV（当前筛选条件）
- （可选）导出账单明细（若后端支持）

------

## 4.3.10 项目审计 `/t/:tenantId/p/:projectId/audit`

同租户审计，但默认过滤 project_id，并支持按资源类型细分：

- 模型、数据集、训练、评估、服务、Key、成员变更、预算配额变更等

------

# 5. 弹窗/抽屉/向导清单（开发可按组件库建立目录）

为确保“覆盖所有弹窗”，这里给出统一清单，建议每个弹窗都有唯一 `modal_id` 便于埋点与测试。

## 5.1 通用类

1. Confirm（普通确认）
2. DangerConfirm（输入名称确认）
3. ReviewChanges（展示变更摘要 + before/after diff）
4. CopySecretOnce（只显示一次 secret 的强制保存弹窗）

## 5.2 租户/项目管理

- CreateProjectWizard
- DeleteProjectDangerConfirm
- InviteUsersDialog
- EditTenantRoleDialog
- AddProjectMemberDialog
- EditProjectMemberRoleDialog
- RemoveMemberConfirm
- CreateServiceAccountDialog
- RotateServiceAccountTokenDialog
- DisableServiceAccountConfirm

## 5.3 模型库

- UploadModelWizard
- CreateModelDialog（若与上传拆开）
- AddModelVersionWizard（给已有模型加版本）
- ManageTagsDialog（Promote/Rollback）
- PromoteTagDialog（含 Gate 校验结果）
- DeleteModelVersionConfirm（依赖检查展示）
- DeleteModelConfirm（依赖检查展示）

## 5.4 数据集

- UploadDatasetVersionWizard
- DeleteDatasetVersionConfirm（依赖检查）
- DeleteDatasetConfirm（依赖检查）

## 5.5 微调

- CreateFineTuneJobWizard
- CancelJobConfirm
- RetryJobConfirm
- CloneJobConfigDialog

## 5.6 评估

- CreateEvalRunWizard
- PromoteToProdFromEvalDialog（带评估证据）
- SideBySideScoringDialog（备注/评分）

## 5.7 推理服务

- CreateServiceWizard
- DeployRevisionWizard
- EditTrafficPolicyDialog
- RollbackDialog
- DeleteServiceDangerConfirm

## 5.8 API Keys

- CreateApiKeyDialog（或 Wizard）
- ShowApiKeySecretOnceDialog
- EditApiKeyDialog（Scopes/limits/expires）
- RotateApiKeyDialog（含 secret once）
- RevokeApiKeyDangerConfirm

## 5.9 配额预算告警

- EditQuotaPolicyDialog（含 JSON 高级编辑器）
- EditBudgetPolicyDialog
- CreateAlertRuleSheet
- EditAlertRuleSheet
- DeleteAlertRuleConfirm
- AckAlertConfirm（可选）

## 5.10 审计

- AuditDetailDrawer（before/after/diff）

------

# 6. 状态、空态、错误码与提示文案规范

## 6.1 空态（必须带 CTA）

- 服务列表空：`“还没有推理服务。创建一个服务将模型部署为 API 端点。”` → [创建服务]
- 模型空：`“还没有可用模型。你可以上传私有模型或从系统模型中选择部署。”` → [上传模型] [浏览系统模型]
- 数据集空：`“上传训练/评估数据集以开始微调或评估。”` → [上传数据集]
- 微调任务空：`“创建微调任务以产出新的模型版本。”` → [创建任务]
- API Key 空：`“创建 Key 以调用推理 API。”` → [创建 Key]

## 6.2 错误码（结合你附录 B）

- **429 rate_limit_exceeded**
  - 展示：`“已触发限流/预算限制，请稍后重试。”`
  - 若返回 `retry-after`：显示倒计时/提示秒数
- **503 service_unavailable**
  - 展示：`“服务暂不可用（可能在冷启动或容量不足）。”`
  - 若当前状态为 Inactive：提示“Scale-to-Zero 冷启动可能 30s–2min”
- **403 insufficient_scope**
  - 展示：`“当前 API Key 权限不足（缺少 xxx scope）。”`
- **409 resource_in_use**
  - 必须展示依赖清单 + 跳转链接

## 6.3 Loading / Skeleton

- 表格：行 skeleton
- 指标卡：卡片 skeleton
- Logs/Metrics：占位 + “加载中”
- Wizard 提交：阻止重复提交 + 显示后台任务链接（如创建微调后跳 job 详情）

------

# 7. 前端数据结构与枚举建议（便于开发对齐）

> 不是代码，仅字段对齐建议，开发可直接映射你 ER。

## 7.1 通用字段显示规则

- `id`：默认显示短 ID（前 8-12 位），hover 展示完整，提供 copy
- `sha256` / `image_digest`：短显示 + copy
- `created_at / updated_at`：统一格式 `YYYY-MM-DD HH:mm:ss`（按 Asia/Tokyo）

## 7.2 核心枚举（用于 StatusBadge）

- Service current_state：Pending / Downloading / Starting / Ready / Inactive / Failed
- Service desired_state：Active / Inactive
- Fine-tuning status：Queued / Running / Succeeded / Failed / Canceled
- Model owner_type：Platform / Tenant
- Model visibility：Private / TenantShared / Public
- Model artifact_type：Full / Adapter / Merged

------

# 8. 你可以直接交付给开发的“验收清单”

为了确保最终页面覆盖所有点，建议按以下清单验收（每条可作为测试用例）：

1. 任意地方选 Tag 都能看到解析后的 version_id，并能复制。
2. 删除模型版本/数据集版本/服务时，如被引用会出现依赖列表（409）。
3. Key/ServiceAccount token 明文只显示一次，关闭前必须勾选“我已保存”。
4. 服务状态流转 UI：Pending/Downloading/Starting/Ready/Inactive/Failed 全部有对应提示与时长显示。
5. Revisions & Traffic：支持 2 个以上 revision 切流，权重总和校验 100。
6. Metrics：至少包含 TTFT/TPOT、P95/P99、Tokens/sec、GPU 利用率、显存、并发、冷启动次数与耗时。
7. Logs：支持过滤/搜索/下载；Prod 环境 Viewer 权限可被限制并有提示。
8. 微调任务：配置向导 + 任务详情含 Metrics（Loss）与 Logs + 失败原因建议。
9. 评估：自动评估 + Side-by-Side 人工评分 + 门禁/Promote 联动。
10. 用量：支持按 service/revision/key/model_version 分组聚合与导出。
11. 租户/项目：成员与角色管理完整；不允许移除最后一个 Owner。
12. 审计：所有写操作在审计中可查，且 before/after diff 可视化。

------

如果你希望我进一步把这份方案“变成更像设计稿的结构化交付物”，我可以在不写代码的前提下，补两类内容来让研发更省心：

1. **逐页“线框图描述”（Wireframe 描述）**：用块级布局把每个页面的区块位置固定下来（Header/Filter/Table/Drawer 等）。
2. **页面级字段字典（Field Dictionary）**：把每个表单字段的类型、默认值、校验、错误文案、后端字段名一一列成清单。

你不需要再提供额外信息，我可以直接基于当前文档继续完善到“字段字典级别”。