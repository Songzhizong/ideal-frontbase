# Table V2 实现任务清单

> 基于 [DESIGN_V2.md](./DESIGN_V2.md) 的分阶段实施计划

---

## 阶段 1：dt 统一模型（核心基础）

### 1.1 类型定义
- [ ] 创建 `types.ts`：`DataTableInstance`、`DataTableStatus`、`DataTableActivity`、`DataTablePagination`、`DataTableSelection`、`DataTableActions`
- [ ] 创建 `TableStateSnapshot`、`TableStateAdapter` 类型
- [ ] 创建 `DataSource`、`DataTableQuery`、`DataTableDataState` 类型
- [ ] 创建 `DataTableFeatures` 及各 feature 配置类型

### 1.2 状态适配器
- [ ] 实现 `stateUrl()`：URL 状态同步适配器
- [ ] 实现 `stateControlled()`：受控状态适配器
- [ ] 实现 `stateInternal()`：内部状态适配器

### 1.3 数据源适配器
- [ ] 实现 `remote()`：TanStack Query 数据源
- [ ] 实现 `local()`：本地数据源

### 1.4 核心 Hook
- [ ] 实现 `useDataTable()`：统一入口
- [ ] 实现 `actions` 对象：所有交互动作
- [ ] 实现 `filters` 对象：强类型筛选模型

### 1.5 最小 UI 闭环
- [ ] 实现 `DataTableRoot`：根容器 + Context Provider
- [ ] 实现 `DataTableTable`：表格渲染组件
- [ ] 实现 `DataTablePagination`：分页组件

---

## 阶段 2：Feature 基础能力

### 2.1 Selection
- [ ] 实现 `selection` feature
- [ ] 创建选择列工厂 `select()`
- [ ] 实现 `DataTableSelectionBar`

### 2.2 Column Visibility
- [ ] 实现 `columnVisibility` feature（含持久化）
- [ ] 实现 `DataTableColumnToggle`

### 2.3 Column Sizing
- [ ] 实现 `columnSizing` feature（含持久化）

---

## 阶段 3：高级能力（后续）

- [ ] 实现 `pinning` feature
- [ ] 实现 `expansion` feature
- [ ] 实现 `density` feature
- [ ] 虚拟滚动 API 预留

---

## 验证计划

- [ ] 单元测试：核心 hooks 和适配器
- [ ] 集成测试：完整 dt 实例行为
- [ ] 手动测试：示例页面验证 UI 交互
