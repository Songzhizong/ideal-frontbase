# 代码风格与命名规范 (Coding Style)

本规范定义了项目的文件管理、代码组织及命名约定。

## 1. 命名约定
- **文件与目录**：统一使用 `kebab-case` (例如：`user-profile.tsx`)。
- **React 组件**：使用 `PascalCase`。
- **自定义 Hook**：
    - 数据获取：`use{Resource}Query` (例如：`useUserQuery`)。
    - 数据变更：`use{Action}{Resource}` (例如：`useUpdateUser`)。
    - 逻辑控制：`use{Feature}Logic`。
- **TypeScript 接口/类型**：使用 `PascalCase`。

## 2. 导入导出规范
- **绝对路径**：必须使用 `@/` 别名（例如：`@/components/ui`）。
- **组件导出**：统一使用有名导出 `export function ComponentName() {}`。

## 3. 格式化工具
- **Biome**：项目唯一指定的 Lint 与 Format 工具。
- **缩进**：使用 Tabs。
- **引号**：使用双引号。

---

> [!NOTE]
> 一致的代码风格能显著降低多人协作时的心智负担。
