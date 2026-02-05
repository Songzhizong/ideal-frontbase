# 表格组件 V2 测试策略

本文档描述 Table V2 组件的测试分层、工具与示例。

---

## 1. 测试分层

| 层级 | 占比 | 关注点 |
|------|------|--------|
| 单元测试 | 60% | State Adapters, Data Sources, Features, Filters |
| 集成测试 | 30% | `useDataTable` Hook 完整流程、状态机转换 |
| E2E 测试 | 10% | URL 同步、偏好持久化、错误恢复 |

---

## 2. 单元测试

### 2.1 测试范围

| 模块 | 测试重点 |
|------|----------|
| State Adapters | 状态读写、序列化/反序列化、行为约定（resetPageOnFilterChange） |
| Data Sources | query 构建、响应映射、错误处理 |
| Features | tableOptions patch、actions patch、meta 扩展 |
| Filters | set/reset 逻辑、类型转换 |

### 2.2 Mock 工具

```ts
// Mock State Adapter
export function createMockStateAdapter<TFilterSchema>(
  initial: TableStateSnapshot<TFilterSchema>
): TableStateAdapter<TFilterSchema> & {
  getHistory: () => TableStateSnapshot<TFilterSchema>[]
} {
  let current = initial
  const history: TableStateSnapshot<TFilterSchema>[] = [initial]
  const listeners = new Set<() => void>()

  return {
    getSnapshot: () => current,
    setSnapshot: (next, reason) => {
      current = next
      history.push(next)
      listeners.forEach((l) => l())
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getHistory: () => history,
  }
}

// Mock Data Source
export function createMockDataSource<TData, TFilterSchema>(
  mockData: TData[],
  options?: {
    delay?: number
    errorOnQuery?: (query: DataTableQuery<TFilterSchema>) => Error | null
  }
): DataSource<TData, TFilterSchema>
```

### 2.3 示例测试

```ts
describe("stateUrl", () => {
  it("should parse URL params correctly", () => {
    const adapter = stateUrl({
      key: "users",
      parsers: { status: parseAsString },
      defaults: { status: "active" },
    })

    mockRouter.setSearch({ "users.status": "inactive" })
    expect(adapter.getSnapshot().filters.status).toBe("inactive")
  })

  it("should reset page when filter changes", () => {
    const adapter = stateUrl({
      key: "users",
      behavior: { resetPageOnFilterChange: true },
    })

    adapter.setSnapshot({ ...adapter.getSnapshot(), page: 5 }, "init")
    adapter.setSnapshot(
      { ...adapter.getSnapshot(), filters: { status: "inactive" } },
      "filters"
    )

    expect(adapter.getSnapshot().page).toBe(1)
  })
})
```

---

## 3. 集成测试

使用 `@testing-library/react` 测试 `useDataTable` Hook 完整流程。

```ts
import { renderHook, act, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

function createTestWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe("useDataTable integration", () => {
  it("should transition from loading to ready", async () => {
    const { result } = renderHook(
      () =>
        useDataTable({
          columns: mockColumns,
          dataSource: createMockDataSource(mockUsers),
          state: createMockStateAdapter(defaultState),
        }),
      { wrapper: createTestWrapper() }
    )

    expect(result.current.activity.isInitialLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.activity.isInitialLoading).toBe(false)
      expect(result.current.status.type).toBe("ready")
    })
  })

  it("should preserve data on refresh error", async () => {
    const dataSource = createMockDataSource(mockUsers, {
      errorOnQuery: (query) =>
        query.page === 2 ? new Error("Network error") : null,
    })

    const { result } = renderHook(
      () => useDataTable({ columns, dataSource, state }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.status.type).toBe("ready"))

    act(() => result.current.actions.setPage(2))

    await waitFor(() => {
      expect(result.current.status.type).toBe("ready") // 保持 ready
      expect(result.current.errors?.nonBlocking).toBeDefined()
    })
  })
})
```

---

## 4. E2E 测试

推荐使用 **Playwright** 或 **Cypress**。

### 4.1 测试范围

- 完整用户流程（搜索 → 筛选 → 排序 → 翻页 → 选择 → 批量操作）
- URL 同步正确性
- 偏好持久化
- 错误恢复

### 4.2 示例

```ts
// Playwright 示例
test.describe("DataTable E2E", () => {
  test("search and filter flow", async ({ page }) => {
    await page.goto("/users")

    await page.getByPlaceholder("搜索...").fill("john")
    await page.waitForTimeout(500) // debounce

    expect(page.url()).toContain("q=john")
    await expect(page.getByRole("row")).toHaveCount(3)

    await page.getByRole("button", { name: "重置" }).click()
    expect(page.url()).not.toContain("q=")
  })

  test("column visibility persistence", async ({ page }) => {
    await page.goto("/users")

    await page.getByRole("button", { name: "列设置" }).click()
    await page.getByLabel("邮箱").uncheck()

    await expect(page.getByRole("columnheader", { name: "邮箱" })).toBeHidden()

    await page.reload()
    await expect(page.getByRole("columnheader", { name: "邮箱" })).toBeHidden()
  })
})
```

---

## 5. 可测试性设计清单

- [ ] 所有 Hook 支持依赖注入（可传入 mock adapter/source）
- [ ] 所有异步操作返回 Promise（便于 await）
- [ ] 所有 DOM 元素有稳定的 `data-testid` 或语义化选择器
- [ ] 提供 `createMockStateAdapter` 和 `createMockDataSource` 测试工具
- [ ] 错误边界覆盖，避免测试时组件静默失败
