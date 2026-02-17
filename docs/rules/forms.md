# 表单处理与错误处理规范 (Forms & Error Handling)

本规范定义了项目中表单的构建标准、交互反馈及错误拦截逻辑。

## 1. 表单构建
- **核心库**：`react-hook-form` + `@hookform/resolvers/zod`。
- **验证策略**：
    - 统一使用 **Zod** 在客户端进行实时验证。
    - 在提交动作（onSubmit）前确保数据合规。
- **UI 组件**：必须使用 `@/packages/ui/form` 提供的封装组件，确保可访问性 (A11y) 和样式一致性。

## 2. 错误处理体系
- **全局拦截 (Interceptors)**：
    - `401 Unauthorized`：统一触发登录态失效逻辑。
    - `500 Internal Server Error`：由全局拦截器弹出错误通知。
- **业务验证错误 (422)**：
    - 捕捉后应手动映射到表单字段，使用 `form.setError("{field}", { message: "..." })`。
- **加载异常 (Boundaries)**：
    - 使用 TanStack Router 的 `errorComponent` 或 React `Suspense` 边界处理加载失败。

## 3. 交互反馈 (UI Feedback)
- **Toast 触发准则**：
    - 严禁在 API 逻辑中弹出 Toast。
    - **成功/失败通知** 必须在组件或 Hook 的 `useMutation({ onSuccess, onError })` 回调中触发。

---

> [!IMPORTANT]
> 优秀的表单不仅在于逻辑正确，更在于提供及时的、友好的错误反馈。
