# 权限控制规则

本文档面向调用方，约束前端权限控制的使用方式与代码风格，确保与项目既有 RBAC 设计保持一致。

## 1. 设计原则
- **统一模型**：始终遵循 RBAC（Role-Based Access Control）。
- **类型安全**：权限标识必须来自 `Permission` 联合类型，避免手写字符串。
- **单一来源**：权限常量必须统一从 `PERMISSIONS` 获取。

## 2. 必用 API
- **权限判断**：仅使用 `hasPermission(permission: Permission | Permission[], mode?: "AND" | "OR")`。
- **权限类型**：`Permission` 来自 `src/types/auth.ts`。
- **权限常量**：使用 `PERMISSIONS`。

## 3. 路由级控制
- 使用 TanStack Router 的 `beforeLoad` 进行权限校验。
- 无权限必须 `redirect` 至 `/errors/403`。

## 4. 菜单级控制
- 在 `nav-config.ts` 中配置 `permission` 字段。
- 菜单过滤交由布局组件处理，禁止在页面内手动隐藏菜单项。

## 5. 组件级与细粒度控制
- **声明式包裹**：使用 `<PermissionGate />` 控制 UI 显隐。
- **按钮权限**：优先使用 `<AuthButton />`，避免自行处理禁用与 Tooltip 逻辑。
- **表格列权限**：通过 `useMemo` 动态拼装 `columns`，避免重复渲染。

## 6. 组合权限与初始化
- **组合逻辑**：
  - `mode = "AND"`：必须同时拥有所有权限。
  - `mode = "OR"`：任意满足即可。
- **初始化延迟**：受保护路由必须等待用户信息初始化完成，避免错误重定向。

## 7. 不允许的做法
- 直接硬编码权限字符串。
- 使用非 `PERMISSIONS` 常量或非 `Permission` 类型进行校验。
