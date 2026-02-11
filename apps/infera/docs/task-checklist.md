# Infera 前端开发任务清单

> AIAgent 按此清单逐项执行。每完成一项勾选 `[x]`，阻塞中标记 `[/]`。
> 每阶段完成后执行 `pnpm run lint` + `pnpm run typecheck` 验证。

**配套文档（实现前必读）**：

- [infera-frontend-design.md](./infera-frontend-design.md) — 功能需求详规
- [ui-design-guide.md](./ui-design-guide.md) — UI/UX 视觉设计规范（配色/排版/组件样式/动效/线框）
- [development-plan.md](./development-plan.md) — 开发计划与阶段依赖

**上下文约束（本阶段）**：

- 登录后使用默认租户，不实现租户选择/切换。
- 租户级接口请求统一通过 `api.withTenantId()` 自动携带租户 ID。
- Sidebar 在同一页面展示两组菜单，通过 `LayoutNavGroup` 隔离；租户菜单分组放上方且无标题。

---

## P0：基础设施与通用组件

### P0.1 应用脚手架与路由骨架

- [x] 确认 `apps/infera` 的 Vite + TanStack Router 基础配置可正常运行
- [x] 配置 ky HTTP 客户端实例 `features/core/api/http-client.ts`
  - Token 注入拦截器
  - 响应错误统一拦截（429 / 403 / 409 / 503 分类处理）
  - 审计成功 toast（写操作提交后附带"查看审计记录"入口）
- [x] 配置 TanStack Query Provider（`app/providers.tsx`）
  - 全局错误回调
  - 默认 staleTime / gcTime 策略
- [x] 验证 `.env` / `.env.dev` / `.env.mock` / `.env.prod` 环境变量配置

### P0.2 全局布局

- [x] 实现 Topbar 组件 `components/topbar/`
  - Logo
  - 移除 Workspace Switcher（不支持租户切换）
  - Breadcrumb（根据 TanStack Router 自动生成）
  - 全局搜索入口（Cmd+K 触发，Phase 7 实现具体逻辑）
  - 通知铃铛（占位，Phase 7 实现）
  - 用户菜单（Profile / Logout）
- [x] 实现 Sidebar 组件 `components/sidebar/`
  - 同页双分组菜单（LayoutNavGroup）
  - 租户菜单分组（Overview / Projects / Users / Billing / Quotas / Alerts / Audit）置顶且不显示标题
  - 项目菜单分组（Dashboard / Models / Datasets / Fine-tuning / Evaluation / Services / API Keys / Usage / Settings / Audit）置于下方
  - 权限控制：无权模块隐藏或锁定 + tooltip
- [x] 实现 Content Layout 组件
  - PageHeader（标题 + 描述 + Primary/Secondary 按钮）
  - 主体内容区

### P0.3 通用业务组件

- [x] `features/shared/components/id-badge.tsx` — IDBadge + Copy
  - 短 ID 显示（前 8-12 位）
  - Copy 按钮
  - Popover 展示完整 ID
- [x] `features/shared/components/status-badge.tsx` — StatusBadge
  - 枚举配置：Pending / Downloading / Starting / Ready / Inactive / Failed / Queued / Running / Succeeded / Canceled
  - 颜色 + 图标 + 文案映射
- [x] `features/shared/components/tag-chips.tsx` — TagChips
  - Model Tag chip 展示（latest / prod / staging）
  - 可点击跳转到版本
- [x] `features/shared/components/empty-state.tsx` — EmptyState
  - 图标 + 描述文案 + CTA 按钮（props 可配）
- [x] `features/shared/components/error-state.tsx` — ErrorState
  - 错误信息 + 重试按钮 + 可展开错误详情
- [x] `features/shared/components/wizard.tsx` — Wizard 多步向导
  - 步骤条（当前步/已完成/待执行）
  - 前进 / 后退 / 提交逻辑
  - 各步骤验证 hook
- [x] `features/shared/components/diff-viewer.tsx` — DiffViewer
  - JSON before/after 对比高亮
- [x] `features/shared/components/log-viewer.tsx` — LogViewer
  - 时间范围、关键字、级别、实例过滤
  - 支持 streaming（SSE/WebSocket）
  - 暂停/继续/下载/复制单行
- [x] `features/shared/components/metrics-panel.tsx` — MetricsPanel
  - 时间范围选择（1h / 6h / 24h / 7d / 自定义）
  - 指标卡片 + 多图表布局
- [x] `features/shared/components/review-changes-dialog.tsx`
  - 展示变更摘要 + before/after diff
- [x] `features/shared/components/danger-confirm-dialog.tsx`
  - 输入名称确认的危险操作弹窗
- [x] `features/shared/components/copy-secret-once-dialog.tsx`
  - 一次性密钥展示 + Copy + "我已保存" checkbox

### P0.4 权限框架

- [x] `features/core/auth/permission-context.tsx` — 权限上下文适配（复用现有 IAM）
  - 仅桥接 `authStore` 的权限状态与 `hasPermission`
  - 禁止自行推导租户角色/项目角色做授权判断
  - 主体类型（user / service_account）与环境标签（Dev / Test / Prod）仅用于 UI 提示
- [x] `features/core/auth/use-permission.ts` — `usePermission` hook
  - 对 `hasPermission(permission, mode)` 的类型安全薄封装（`Permission` + `PERMISSIONS`）
  - 支持 `AND/OR` 组合权限
  - Prod 环境额外限制检查（业务提示，不替代权限判断）
- [x] `features/shared/components/permission-guard.tsx` — PermissionGuard 组件
  - 内部复用 `PermissionGate` / `AuthButton`
  - 按钮/入口级 显示 / 隐藏 / 禁用
  - 禁用时展示原因 tooltip
- [x] 路由 `beforeLoad` 权限校验统一化
  - 无权限统一跳转 `/errors/403`
  - 禁止在页面组件内部做路由级重定向兜底
- [x] Sidebar 导航权限配置统一化
  - 菜单项通过 `permission` 字段声明权限
  - 菜单过滤由布局层统一处理

### P0.5 全局错误处理

- [x] 429 `rate_limit_exceeded` → 限流提示 + retry-after 倒计时
- [x] 503 `service_unavailable` → 冷启动/容量不足提示
- [x] 403 `insufficient_scope` → 权限不足提示
- [x] 409 `resource_in_use` → 依赖列表弹窗 + 跳转链接

---

## P1：认证

### P1.1 登录页

- [x] `routes/_blank/login.tsx` — 登录路由
- [x] `features/auth/components/login-form.tsx` — 登录表单
  - Email（必填，邮箱格式 Zod 校验）
  - Password（必填）
  - 登录按钮（Loading 状态）
  - SSO 入口按钮（占位）
- [x] `features/auth/api/auth-api.ts` — 登录 API
- [x] `features/auth/hooks/use-login.ts` — 登录 mutation hook
- [x] 错误提示：统一文案（避免信息泄露）
- [x] 登录成功 → 保存 token + 默认 tenantId → 跳转 `/t/:tenantId/overview`
- [x] 下线工作区选择流（`/workspace` 路由与相关 selector/api/hooks）

---

## P2：租户级功能

### P2.1 租户概览

- [x] `routes/_authenticated/t/$tenantId/overview.tsx` — 路由
- [x] `features/tenant/overview/` — 概览模块
  - 指标卡组件（余额、本月成本、今日 tokens、活跃项目/服务、告警数）
  - 成本趋势折线图（7/30 天切换）
  - 项目成本 Top 5 表格
  - 最近审计事件列表
- [x] API 层 + Query Hooks

### P2.2 项目管理

- [x] `routes/_authenticated/t/$tenantId/projects.tsx` — 路由
- [x] `features/tenant/projects/` — 项目管理模块
  - 项目列表 DataTable（列：名称/env/Owner/服务数/本月成本/tokens/更新时间/操作）
  - 筛选：env / Owner / 成本范围 / 关键字
  - 创建项目弹窗（名称/env/描述/配额策略/初始成员）
  - 删除项目（DangerConfirm + 级联资源清单）
- [x] API 层 + Query Hooks

### P2.3 用户与邀请

- [x] `routes/_authenticated/t/$tenantId/users.tsx` — 路由
- [x] `features/tenant/users/` — 用户管理模块
  - Users Tab：用户表格（姓名/Email/角色/状态/最近登录/操作）
  - Invitations Tab：邀请记录表格
  - 邀请用户弹窗（批量邮箱/租户角色/分配项目+角色）
  - 编辑角色弹窗、禁用/启用、重发邀请
- [x] API 层 + Query Hooks

### P2.4 账单与发票

- [x] `routes/_authenticated/t/$tenantId/billing.tsx` — 路由
- [x] `features/tenant/billing/` — 账单模块
  - Usage & Cost Tab
  - Invoices Tab（表格 + 下载 + 明细详情）
  - Payment Methods Tab
  - Cost Allocation Tab（成本分摊：按项目/Key/服务）
  - CSV 导出
- [x] API 层 + Query Hooks

### P2.5 配额与预算

- [x] `routes/_authenticated/t/$tenantId/quotas-budgets.tsx` — 路由
- [x] `features/tenant/quotas-budgets/` — 配额预算模块
  - Quotas Tab（简单模式 + JSON 高级模式）
  - Budgets Tab（日/月预算/阈值/超限动作/通知渠道）
  - Policy History Tab
  - ReviewChanges 确认弹窗
- [x] API 层 + Query Hooks

### P2.6 告警中心

- [x] `routes/_authenticated/t/$tenantId/alerts.tsx` — 路由
- [x] `features/tenant/alerts/` — 告警模块
  - Active Alerts Tab（列表 + Ack + 跳转）
  - Alert Rules Tab（表格 + 创建/编辑 Sheet 抽屉）
  - History Tab
  - 告警规则 Sheet（规则名/类型/范围/指标条件/持续时间/通知/超限动作）
- [x] API 层 + Query Hooks

### P2.7 租户审计

- [x] `routes/_authenticated/t/$tenantId/audit.tsx` — 路由
- [x] `features/tenant/audit/` — 审计模块
  - 审计表格（时间/Actor/Action/Resource/Project/IP/UA/操作）
  - 筛选（时间范围/Actor/Action/Resource type/Project）
  - 审计详情 Drawer（基本信息/Resource/before/after JSON/Diff 高亮）
- [x] API 层 + Query Hooks

---

## P3：项目级核心 — 模型与数据集

### P3.1 项目看板

- [x] `routes/_authenticated/t/$tenantId/p/$projectId/dashboard.tsx` — 路由
- [x] `features/project/dashboard/` — 看板模块
  - 概览指标卡（运行服务数/模型数/本月成本/today tokens/错误率）
  - 最近部署列表（服务名/revision/操作者/时间/结果）
  - 活跃告警（Ack/跳转）
  - 最近审计事件
  - 时间范围切换（1h/24h/7d）
- [x] API 层 + Query Hooks

### P3.2 项目设置

- [x] `routes/_authenticated/t/$tenantId/p/$projectId/settings.tsx` — 路由
- [x] `features/project/settings/` — 设置模块
  - Overview Tab（名称/env/描述可编辑 + 项目 ID copy + 创建信息）
  - Members Tab（表格 + 添加/修改角色/移除 + 最后 Owner 保护）
  - Service Accounts Tab（表格 + 创建/轮换 Token/禁用/删除 + CopySecretOnce）
  - Quotas & Budgets Tab（继承/覆盖租户策略 + Review）
  - Environment Policies Tab（Prod 限制 toggle 开关）
  - Danger Zone（删除项目）
- [x] API 层 + Query Hooks

### P3.3 模型库列表

- [x] `routes/_authenticated/t/$tenantId/p/$projectId/models/index.tsx` — 路由
- [x] `features/project/models/` — 模型模块
  - Available / System / Tenant Models 三 Tab
  - 模型表格（Name/来源/Visibility/Tags/Latest Version/参数量/Used by/更新时间/操作）
  - 筛选（来源/visibility/license/format/artifact_type/quantization/关键字）
  - "上传模型"主按钮
- [x] API 层 + Query Hooks

### P3.4 模型详情

- [x] `routes/_authenticated/t/$tenantId/p/$projectId/models/$modelId.tsx` — 路由
- [x] `features/project/models/components/model-detail/`
  - Header（模型名 + Badge + Tag Chips + 操作按钮组）
  - Overview Tab（Model ID/owner/visibility/描述/最近版本摘要）
  - Versions Tab（版本表格 + 版本详情 Drawer + 操作）
  - Tags Tab（Tag 表格 + Promote/Rollback/删除）
  - Usage Tab（被引用的 Service Revision 表格）
  - Audit Tab
- [x] Promote Tag 流程（含 Gate 校验结果展示）
- [x] 删除版本/模型弹窗（409 依赖列表展示 + 跳转）

### P3.5 上传模型向导

- [x] `features/project/models/components/upload-model-wizard.tsx`
  - Step 1：新建/已有模型 + 名称 + visibility + 描述
  - Step 2：上传方式（Web Upload / CLI Upload）+ 格式选择
  - Step 3：版本信息（artifact_type/base_model_version_id/metadata）
  - Step 4：确认（sha256/size/format/model_version_id）
  - 上传进度条 + 错误重试

### P3.6 数据集列表与详情

- [x] `routes/_authenticated/t/$tenantId/p/$projectId/datasets/index.tsx` — 列表路由
- [x] `routes/_authenticated/t/$tenantId/p/$projectId/datasets/$datasetId.tsx` — 详情路由
- [x] `features/project/datasets/` — 数据集模块
  - 列表表格（名称/dataset_version_id/rows/token 统计/schema/used_by/更新时间/操作）
  - 详情 Header + Tabs（Versions/Preview/Usage/Audit）
  - 版本表格 + 版本详情 Drawer（全字段/schema JSON/token_stats 指标卡）
- [x] API 层 + Query Hooks

### P3.7 上传数据集向导

- [x] `features/project/datasets/components/upload-dataset-wizard.tsx`
  - Step 1：新建/选择已有数据集 + 名称
  - Step 2：上传 JSONL（拖拽 + 多文件合并 + 基础校验）
  - Step 3：解析统计（rows/schema/token 统计 + 错误行展示）
  - Step 4：确认提交（dataset_version_id）

---

## P4：微调与评估

### P4.1 微调任务列表

- [x] `routes/_authenticated/t/$tenantId/p/$projectId/fine-tuning/index.tsx` — 路由
- [x] `features/project/fine-tuning/` — 微调模块
  - 任务表格（job_id/名称/base_model/dataset/方法/资源/状态/进度/成本/创建信息/操作）
  - 筛选（状态/方法/创建人/时间范围）
- [x] API 层 + Query Hooks

### P4.2 创建微调任务向导

- [x] `features/project/fine-tuning/components/create-job-wizard.tsx`
  - Step 1：选择基座模型（Tag→解析 version_id + 模型 metadata + 输出模型命名）
  - Step 2：选择训练数据（dataset + version + 展示 rows/schema/token_stats + mismatch 风险提示）
  - Step 3：训练配置（LoRA/Full + Epochs + Batch + LR + 高级参数折叠）
  - Step 4：计算资源与成本预估（GPU 规格 + 资源池 + 预估 GPU-hours/费用）
  - Step 5：确认提交（Summary 卡片）

### P4.3 微调任务详情

- [x] `routes/_authenticated/t/$tenantId/p/$projectId/fine-tuning/$jobId.tsx` — 路由
- [x] `features/project/fine-tuning/components/job-detail/`
  - Header（状态 Badge + 取消/重试/克隆/查看产出 操作）
  - Overview Tab（配置信息 + 数据/模型链接 + 时间线 + Failed 原因分类与建议）
  - Metrics Tab（Loss 曲线 + 学习率曲线 + 时间/step 过滤）
  - Logs Tab（LogViewer 实时流 + 搜索 + 下载 + 错误行高亮）
  - Artifacts Tab（产物列表 + 注册 Tag / 部署为服务 / 发起评估入口）
  - Audit Tab

### P4.4 评估列表

- [x] `routes/_authenticated/t/$tenantId/p/$projectId/evaluation/index.tsx` — 路由
- [x] `features/project/evaluation/` — 评估模块
  - 评估表格（eval_run_id/评估对象/测试集/指标摘要/状态/结果/创建信息/操作）
- [x] API 层 + Query Hooks

### P4.5 创建评估向导

- [x] `features/project/evaluation/components/create-eval-wizard.tsx`
  - Step 1：选择评估类型（自动/对比/回归门禁）
  - Step 2：选择模型与数据（model_version_id/dataset_version_id/benchmark/指标多选）
  - Step 3：配置与确认

### P4.6 评估详情

- [x] `routes/_authenticated/t/$tenantId/p/$projectId/evaluation/$evalRunId.tsx` — 路由
- [x] `features/project/evaluation/components/eval-detail/`
  - Header（状态 + Pass/Fail + 操作）
  - Report Tab（指标卡 + 明细表 + 结论摘要）
  - Side-by-Side Tab（双列对比 + 参数区 + Diff 高亮 + 人工评分 + 标记 Winner）
  - Gate Tab（门禁规则 vs 结果 + 未通过：禁止 Promote + 建议 / 通过：Promote 按钮）
  - Audit Tab

---

## P5：推理服务

### P5.1 服务列表

- [x] `routes/_authenticated/t/$tenantId/p/$projectId/services/index.tsx` — 路由
- [x] `features/project/services/` — 推理服务模块
  - 服务表格（名称/env/current state/desired state/Endpoint/模型版本/Runtime/Replicas/QPS·P95·错误率/更新时间/操作）
  - 筛选（env/状态/runtime/模型/Inactive/错误率）
- [x] API 层 + Query Hooks

### P5.2 创建服务向导

- [x] `features/project/services/components/create-service-wizard.tsx`
  - Step 1：基础信息（名称/描述/env/Public·Private/IP Allowlist/API 协议只读）
  - Step 2：选择模型（Tag 或 version_id + 展示解析后 version_id + metadata 摘要）
  - Step 3：选择 Runtime（vLLM/TGI/Triton/HF + 推荐说明 + 高级参数折叠）
  - Step 4：资源规格（GPU 型号·数量/CPU/Memory + 校验提示 + 成本估算）
  - Step 5：弹性伸缩（指标类型/Min·Max Replicas/Scale-down Delay/Scale-to-Zero + Prod 策略联动）
  - Step 6：确认创建（Summary）

### P5.3 服务详情页 — Header + 状态区

- [x] `routes/_authenticated/t/$tenantId/p/$projectId/services/$serviceId.tsx` — 路由
- [x] `features/project/services/components/service-detail/`
  - Header（服务名+env+状态 Badge / Endpoint Copy / Desired State 开关 / 快捷操作组）
  - 状态流转步骤条（Pending → Downloading → Starting → Ready + 持续时间 + 解释文案）
  - Pending 超时提示（资源不足原因 + CTA）

### P5.4 Revisions & Traffic Tab

- [x] `features/project/services/components/service-detail/revisions-traffic.tsx`
  - Revision 列表表格（revision_id/created/model_version/runtime/image_digest/resource/autoscaling/config_hash/状态/流量/操作）
  - Traffic Editor（权重输入 + slider + 自动归一化 + 100 校验 + before/after 确认）
  - Deploy new revision 向导（选模型 → runtime → 资源/autoscaling → Diff Review → 发布策略）
  - 一键回滚弹窗（历史 revision 选择 + 确认 → 切流 100%）
  - 流量变更确认弹窗

### P5.5 Metrics Tab

- [x] `features/project/services/components/service-detail/service-metrics.tsx`
  - 控制条（时间范围/粒度/revision 过滤/对比模式）
  - 指标卡（成功率/P95/P99/TTFT/TPOT/Tokens per sec/GPU 利用率/显存/并发/冷启动）
  - 图表区（QPS / 延迟 / 成功率·错误率 / TTFT·TPOT / Tokens/sec / GPU Util·Memory / 冷启动）
  - 图表 hover 数值 + CSV 导出

### P5.6 Logs Tab

- [x] `features/project/services/components/service-detail/service-logs.tsx`
  - LogViewer 集成（时间/revision/instance/level 过滤 + 关键字搜索）
  - 流式刷新（暂停/继续）
  - 下载 + 复制单行
  - Prod 权限限制：无权时锁定状态 + 提示文案

### P5.7 Playground Tab

- [x] `features/project/services/components/service-detail/playground.tsx`
  - 左侧：Chat 对话区（消息列表 + 输入框 + 发送）
  - 右侧：参数面板（model/revision + temperature/top_p/max_tokens/stop 等 + stream 开关 + token 用量）
  - 底部：Raw Request/Response（折叠）
  - 流式输出（SSE）
  - Prod 限制提示（记录 Prompt/Response 默认关闭 + 合规文案）

### P5.8 Settings + Audit Tab

- [x] `features/project/services/components/service-detail/service-settings.tsx`
  - 基础信息（名称/描述编辑）
  - 网络配置（Public/Private/IP allowlist）
  - Runtime & Resources（编辑 → 触发 Deploy new revision）
  - Autoscaling（编辑 → 触发 Deploy new revision）
  - 合规与留存（Prompt/Response 记录策略 占位）
  - Danger Zone（删除服务 — 输入名称确认 + endpoint 影响提示）
- [x] `features/project/services/components/service-detail/service-audit.tsx`
  - 默认过滤 service_id 的审计表格

---

## P6：API Keys + 用量与成本

### P6.1 API Key 列表

- [x] `routes/_authenticated/t/$tenantId/p/$projectId/api-keys/index.tsx` — 路由
- [x] `features/project/api-keys/` — API Key 模块
  - Key 表格（名称/api_key_id/scopes/RPM/Daily limit/Expires/状态/Last used/创建时间/操作）
  - 筛选（状态/scope/即将过期）
- [x] API 层 + Query Hooks

### P6.2 创建 API Key

- [x] `features/project/api-keys/components/create-key-dialog.tsx`
  - 名称 + Scopes 多选 + 过期时间 + RPM limit + Daily token limit + 备注
  - 提交后 → CopySecretOnce 弹窗（明文 key + Copy + 下载 .txt + "我已保存" checkbox）

### P6.3 Key 详情

- [x] `routes/_authenticated/t/$tenantId/p/$projectId/api-keys/$apiKeyId.tsx` — 路由
- [x] `features/project/api-keys/components/key-detail/`
  - Overview Tab（key_id/scopes/limits/created/状态）
  - Usage Tab（时间范围+图表：tokens/请求/延迟/状态码 + 关联服务 Top 表格）
  - Audit Tab
  - Rotate Key 弹窗（新旧 key 策略 + CopySecretOnce）
  - Revoke Key（DangerConfirm — 输入 key 名称或 "REVOKE" + 影响提示）

### P6.4 用量与成本

- [x] `routes/_authenticated/t/$tenantId/p/$projectId/usage.tsx` — 路由
- [x] `features/project/usage/` — 用量模块
  - 顶部过滤条（时间范围 / Group by / 维度过滤 / 粒度）
  - 指标卡（prompt_tokens/completion_tokens/total_tokens / 平均延迟·P95 / 成功率 / 预估成本）
  - 图表区（tokens 趋势/成本趋势/请求数趋势/延迟趋势/状态码分布）
  - 聚合表格（随 Group by 变化列 + 钻取跳转）
  - CSV 导出
- [x] API 层 + Query Hooks

---

## P7：高级功能与集成

### P7.1 项目审计

- [x] `routes/_authenticated/t/$tenantId/p/$projectId/audit.tsx` — 路由
- [x] `features/project/audit/` — 复用租户审计组件，默认过滤 project_id
- [x] 按资源类型细分过滤

### P7.2 全局搜索（Cmd+K）

- [x] `features/shared/components/command-palette.tsx`
  - 搜索 Dialog（模型/服务/Key/任务/用户等结果分组）
  - 快捷跳转

### P7.3 通知中心

- [x] `features/shared/components/notification-panel.tsx`
  - 通知铃铛 + 下拉面板
  - 告警消息 + 操作完成通知
  - 未读数 Badge

### P7.4 跨模块联动

- [x] 微调 Artifacts → 注册 Tag 跳转 / 部署为服务跳转
- [x] 评估 Gate 通过 → Promote to prod tag 联动
- [x] 用量聚合表格 → 钻取至服务 Metrics 或 Key Usage
- [x] 写操作成功 toast → "查看审计记录"入口跳转
- [x] Tag 选择 → 展示解析后 version_id 全局一致

---

## P8：平台控制台（可选）

### P8.1 布局与权限

- [ ] `/platform` 独立路由布局
- [ ] 平台管理员权限检查 Guard

### P8.2 租户管理

- [ ] `routes/_authenticated/platform/tenants.tsx`
- [ ] `features/platform/tenants/` — 跨租户管理

### P8.3 系统模型管理

- [ ] `routes/_authenticated/platform/system-models.tsx`
- [ ] `features/platform/system-models/` — 系统模型管理

### P8.4 平台审计

- [ ] `routes/_authenticated/platform/audit.tsx`
- [ ] `features/platform/audit/` — 平台级审计

---

## 执行验证检查点

每个阶段（P0-P8）完成后，AIAgent 必须执行以下验证：

### 代码质量验证

- [x] `pnpm run lint` — 无 error
- [x] `pnpm run typecheck` — 无 error
- [ ] 页面可正常渲染（有 Mock 数据时）
- [ ] 路由可正常跳转
- [ ] 权限控制生效（按 IAM 权限标识显示/隐藏/禁用）

### UI/UX 视觉验证（参照 [ui-design-guide.md](./ui-design-guide.md)）

- [ ] 颜色全部使用 Shadcn 语义变量（`bg-background` 等），零硬编码
- [ ] StatusBadge 状态色与规范一致（Ready=emerald, Running=blue, Failed=destructive 等）
- [ ] 页面间距符合规范（`px-6 py-6`，区块 `space-y-6`）
- [ ] 表格外层有 `overflow-x-auto rounded-lg border border-border/50`
- [ ] 空态页面使用 EmptyState 组件（图标 + 文案 + CTA）
- [ ] 错误态使用 ErrorState 组件（信息 + 重试 + 可展开详情）
- [ ] 加载态使用 Skeleton 骨架屏，非空白等待
- [ ] 所有可点击元素有 `cursor-pointer`
- [ ] 表格行/卡片有 hover 反馈（`hover:bg-muted/50`）
- [ ] 过渡动效 150-300ms（`transition-colors` / `transition-all`）
- [ ] 图标统一使用 Lucide React，无 emoji 图标
- [ ] Dark Mode 和 Light Mode 均对比度正常
- [ ] 焦点状态可见（键盘 Tab/Enter/Escape 可用）
- [ ] 图表使用 Recharts + Shadcn chart 变量
- [ ] 指标卡使用 `text-3xl font-bold tabular-nums` 样式
- [ ] ID/Hash 显示使用 `font-mono text-xs bg-muted` + Copy 按钮
