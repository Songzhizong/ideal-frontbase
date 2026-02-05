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
  reset: () => void
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
    reset: () => {
      current = initial
      history.length = 0
      history.push(initial)
    },
  }
}

// Mock Data Source
export function createMockDataSource<TData, TFilterSchema>(
  mockData: TData[],
  options?: {
    delay?: number
    errorOnQuery?: (query: DataTableQuery<TFilterSchema>) => Error | null
    pageSize?: number
  }
): DataSource<TData, TFilterSchema> {
  return {
    use: (query) => {
      const [data, setData] = useState<DataTableDataResult<TData> | null>(null)
      const [isInitialLoading, setIsInitialLoading] = useState(true)
      const [isFetching, setIsFetching] = useState(false)
      const [error, setError] = useState<unknown | null>(null)

      useEffect(() => {
        const fetchData = async () => {
          setIsFetching(true)

          if (options?.delay) {
            await new Promise((resolve) => setTimeout(resolve, options.delay))
          }

          const queryError = options?.errorOnQuery?.(query)
          if (queryError) {
            setError(queryError)
            setIsInitialLoading(false)
            setIsFetching(false)
            return
          }

          const pageSize = options?.pageSize ?? query.size
          const start = (query.page - 1) * pageSize
          const end = start + pageSize
          const rows = mockData.slice(start, end)

          setData({
            rows,
            pageCount: Math.ceil(mockData.length / pageSize),
            total: mockData.length,
          })
          setError(null)
          setIsInitialLoading(false)
          setIsFetching(false)
        }

        fetchData()
      }, [query.page, query.size, JSON.stringify(query.sort), JSON.stringify(query.filters)])

      return {
        data,
        isInitialLoading,
        isFetching,
        error,
        refetch: () => {
          setIsFetching(true)
          // 触发重新获取
        },
        retry: () => {
          setError(null)
          setIsFetching(true)
        },
      }
    },
  }
}

// Mock Storage
export function createMockStorage<TValue>(
  initialData: Record<string, TValue> = {},
  options?: { delay?: number }
): TablePreferenceStorage<TValue> {
  const storage = new Map<string, TValue>(Object.entries(initialData))

  return {
    getSync: (key) => storage.get(key) ?? null,
    get: async (key) => {
      if (options?.delay) {
        await new Promise((resolve) => setTimeout(resolve, options.delay))
      }
      return storage.get(key) ?? null
    },
    set: async (key, value) => {
      if (options?.delay) {
        await new Promise((resolve) => setTimeout(resolve, options.delay))
      }
      storage.set(key, value)
    },
    remove: async (key) => {
      storage.delete(key)
    },
  }
}
```

### 2.3 示例测试

#### State Adapter 测试

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

  it("should serialize sort as array", () => {
    const adapter = stateUrl({
      key: "users",
      parsers: {},
    })

    adapter.setSnapshot(
      {
        ...adapter.getSnapshot(),
        sort: [
          { field: "name", order: "asc" },
          { field: "createdAt", order: "desc" },
        ],
      },
      "sort"
    )

    const url = mockRouter.getSearch()
    expect(url["users.sort"]).toEqual(["name.asc", "createdAt.desc"])
  })

  it("should handle array filters correctly", () => {
    const adapter = stateUrl({
      key: "users",
      parsers: { roles: parseAsArrayOf(parseAsString) },
    })

    // URL: ?users.roles=admin&users.roles=editor
    mockRouter.setSearch({ "users.roles": ["admin", "editor"] })

    expect(adapter.getSnapshot().filters.roles).toEqual(["admin", "editor"])
  })

  it("should apply custom middleware", () => {
    const middleware: UrlStateMiddleware<{ status: string }> = ({ prev, next }) => {
      // 自定义逻辑：搜索变化时也重置 page
      if (prev.filters.status !== next.filters.status) {
        return { ...next, page: 1 }
      }
      return next
    }

    const adapter = stateUrl({
      key: "users",
      parsers: { status: parseAsString },
      behavior: { middleware },
    })

    adapter.setSnapshot({ ...adapter.getSnapshot(), page: 5 }, "init")
    adapter.setSnapshot(
      { ...adapter.getSnapshot(), filters: { status: "inactive" } },
      "filters"
    )

    expect(adapter.getSnapshot().page).toBe(1)
  })
})

describe("stateControlled", () => {
  it("should call onChange when state changes", () => {
    const onChange = vi.fn()

    const adapter = stateControlled({
      value: { page: 1, size: 10, sort: [], filters: {} },
      onChange,
    })

    adapter.setSnapshot({ page: 2, size: 10, sort: [], filters: {} }, "page")

    expect(onChange).toHaveBeenCalledWith({
      page: 2,
      size: 10,
      sort: [],
      filters: {},
    })
  })
})

describe("stateInternal", () => {
  it("should use initial values", () => {
    const adapter = stateInternal({
      initial: {
        page: 2,
        size: 20,
        filters: { status: "active" },
      },
    })

    const snapshot = adapter.getSnapshot()
    expect(snapshot.page).toBe(2)
    expect(snapshot.size).toBe(20)
    expect(snapshot.filters.status).toBe("active")
  })
})
```

#### Data Source 测试

```ts
describe("remote data source", () => {
  it("should build query correctly", async () => {
    const queryFn = vi.fn().mockResolvedValue({
      items: mockUsers,
      total: 100,
    })

    const dataSource = remote({
      queryKey: ["users"],
      queryFn,
      map: (res) => ({
        rows: res.items,
        pageCount: Math.ceil(res.total / 10),
        total: res.total,
      }),
    })

    const { result } = renderHook(
      () =>
        dataSource.use({
          page: 2,
          size: 10,
          sort: [{ field: "name", order: "asc" }],
          filters: { status: "active" },
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.data).not.toBeNull())

    expect(queryFn).toHaveBeenCalledWith({
      page: 2,
      size: 10,
      sort: [{ field: "name", order: "asc" }],
      filters: { status: "active" },
    })
  })

  it("should stabilize queryKey with filters", async () => {
    const queryFn = vi.fn().mockResolvedValue({ items: [], total: 0 })

    const dataSource = remote({
      queryKey: ["users"],
      queryFn,
      map: (res) => ({ rows: res.items, pageCount: 0, total: 0 }),
    })

    const { rerender } = renderHook(
      ({ filters }) =>
        dataSource.use({
          page: 1,
          size: 10,
          sort: [],
          filters,
        }),
      {
        wrapper: createTestWrapper(),
        initialProps: { filters: { status: "active", role: "admin" } },
      }
    )

    await waitFor(() => expect(queryFn).toHaveBeenCalledTimes(1))

    // 重新渲染，filters 对象引用变化但值相同
    rerender({ filters: { status: "active", role: "admin" } })

    // queryFn 不应该被再次调用（queryKey 稳定）
    expect(queryFn).toHaveBeenCalledTimes(1)
  })
})

describe("local data source", () => {
  it("should filter and paginate locally", async () => {
    const allUsers = Array.from({ length: 50 }, (_, i) => ({
      id: `user-${i}`,
      name: `User ${i}`,
      status: i % 2 === 0 ? "active" : "inactive",
    }))

    const dataSource = local({ rows: allUsers })

    const { result } = renderHook(
      () =>
        dataSource.use({
          page: 2,
          size: 10,
          sort: [],
          filters: { status: "active" },
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.data).not.toBeNull())

    expect(result.current.data?.rows.length).toBe(10)
    expect(result.current.data?.total).toBe(25) // 50 个用户中有 25 个 active
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

## 5. Feature 测试

### 5.1 Selection Feature

```ts
describe("Selection Feature", () => {
  it("should support page mode selection", async () => {
    const { result } = renderHook(
      () =>
        useDataTable({
          columns,
          dataSource: createMockDataSource(mockUsers),
          state: createMockStateAdapter(defaultState),
          features: { selection: { mode: "page" } },
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.status.type).toBe("ready"))

    expect(result.current.selection.enabled).toBe(true)
    expect(result.current.selection.mode).toBe("page")

    act(() => result.current.table.getRow("user-1").toggleSelected())
    expect(result.current.selection.selectedRowIds).toEqual(["user-1"])

    act(() => result.current.actions.setPage(2))
    expect(result.current.selection.selectedRowIds).toEqual([]) // 翻页清空
  })

  it("should support cross-page selection", async () => {
    const { result } = renderHook(
      () =>
        useDataTable({
          columns,
          dataSource: createMockDataSource(mockUsers),
          state: createMockStateAdapter(defaultState),
          features: { selection: { mode: "cross-page" } },
          getRowId: (row) => row.id,
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.status.type).toBe("ready"))

    act(() => result.current.table.getRow("user-1").toggleSelected())
    act(() => result.current.actions.setPage(2))

    expect(result.current.selection.selectedRowIds).toContain("user-1") // 保留选择
  })

  it("should handle selectAllCurrentPage", async () => {
    const { result } = renderHook(
      () =>
        useDataTable({
          columns,
          dataSource: createMockDataSource(mockUsers),
          state: createMockStateAdapter(defaultState),
          features: { selection: { mode: "page" } },
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.status.type).toBe("ready"))

    act(() => result.current.actions.selectAllCurrentPage())
    expect(result.current.selection.selectedRowIds.length).toBe(10) // 当前页所有行
  })
})
```

### 5.2 Column Visibility Feature

```ts
describe("Column Visibility Feature", () => {
  it("should persist column visibility to storage", async () => {
    const mockStorage = createMockStorage<Record<string, boolean>>()

    const { result } = renderHook(
      () =>
        useDataTable({
          columns,
          dataSource: createMockDataSource(mockUsers),
          state: createMockStateAdapter(defaultState),
          features: {
            columnVisibility: {
              storageKey: "users.columns",
              storage: mockStorage,
            },
          },
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.status.type).toBe("ready"))

    act(() => result.current.table.getColumn("email").toggleVisibility(false))

    await waitFor(() => {
      expect(mockStorage.get("users.columns")).resolves.toEqual({
        email: false,
      })
    })
  })

  it("should merge stored preferences with current columns", async () => {
    const mockStorage = createMockStorage<Record<string, boolean>>({
      "users.columns": { email: false, deletedColumn: false }, // deletedColumn 已不存在
    })

    const { result } = renderHook(
      () =>
        useDataTable({
          columns: [
            { id: "name", accessorKey: "name" },
            { id: "email", accessorKey: "email" },
            { id: "newColumn", accessorKey: "newColumn" }, // 新增列
          ],
          dataSource: createMockDataSource(mockUsers),
          state: createMockStateAdapter(defaultState),
          features: {
            columnVisibility: {
              storageKey: "users.columns",
              storage: mockStorage,
            },
          },
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.activity.preferencesReady).toBe(true))

    expect(result.current.table.getColumn("email").getIsVisible()).toBe(false)
    expect(result.current.table.getColumn("newColumn").getIsVisible()).toBe(true) // 新列默认可见
    expect(result.current.table.getColumn("deletedColumn")).toBeUndefined() // 旧列已清理
  })

  it("should handle preference version migration", async () => {
    const mockStorage = createMockStorage<PreferenceEnvelope<Record<string, boolean>>>({
      "users.columns": {
        schemaVersion: 1,
        updatedAt: Date.now(),
        value: { oldColumnName: false },
      },
    })

    const migration: PreferenceMigration<Record<string, boolean>> = ({ value }) => {
      // 列重命名迁移
      const { oldColumnName, ...rest } = value
      return { ...rest, newColumnName: oldColumnName }
    }

    const { result } = renderHook(
      () =>
        useDataTable({
          columns: [
            { id: "name", accessorKey: "name" },
            { id: "newColumnName", accessorKey: "newColumnName" },
          ],
          dataSource: createMockDataSource(mockUsers),
          state: createMockStateAdapter(defaultState),
          features: {
            columnVisibility: {
              storageKey: "users.columns",
              storage: mockStorage,
              schemaVersion: 2,
              migration,
            },
          },
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.activity.preferencesReady).toBe(true))

    expect(result.current.table.getColumn("newColumnName").getIsVisible()).toBe(false)
  })
})

### 5.3 Column Sizing Feature

```ts
describe("Column Sizing Feature", () => {
  it("should persist column widths", async () => {
    const mockStorage = createMockStorage<Record<string, number>>()

    const { result } = renderHook(
      () =>
        useDataTable({
          columns,
          dataSource: createMockDataSource(mockUsers),
          state: createMockStateAdapter(defaultState),
          features: {
            columnSizing: {
              storageKey: "users.sizing",
              storage: mockStorage,
            },
          },
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.status.type).toBe("ready"))

    act(() => result.current.table.getColumn("name").setSize(200))

    await waitFor(() => {
      expect(mockStorage.get("users.sizing")).resolves.toEqual({
        name: 200,
      })
    })
  })

  it("should apply min/max width constraints", async () => {
    const { result } = renderHook(
      () =>
        useDataTable({
          columns: [
            {
              id: "name",
              accessorKey: "name",
              minSize: 100,
              maxSize: 300,
            },
          ],
          dataSource: createMockDataSource(mockUsers),
          state: createMockStateAdapter(defaultState),
          features: {
            columnSizing: {
              storageKey: "users.sizing",
            },
          },
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.status.type).toBe("ready"))

    act(() => result.current.table.getColumn("name").setSize(50)) // 小于 minSize
    expect(result.current.table.getColumn("name").getSize()).toBe(100)

    act(() => result.current.table.getColumn("name").setSize(400)) // 大于 maxSize
    expect(result.current.table.getColumn("name").getSize()).toBe(300)
  })
})

### 5.4 Density Feature

```ts
describe("Density Feature", () => {
  it("should persist density preference", async () => {
    const mockStorage = createMockStorage<"compact" | "comfortable">()

    const { result } = renderHook(
      () =>
        useDataTable({
          columns,
          dataSource: createMockDataSource(mockUsers),
          state: createMockStateAdapter(defaultState),
          features: {
            density: {
              storageKey: "users.density",
              storage: mockStorage,
              default: "comfortable",
            },
          },
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.status.type).toBe("ready"))

    // 假设 density 状态通过 table.options.meta 暴露
    act(() => result.current.table.options.meta?.setDensity("compact"))

    await waitFor(() => {
      expect(mockStorage.get("users.density")).resolves.toBe("compact")
    })
  })
})
```

### 5.5 Tree Feature

```ts
describe("Tree Feature", () => {
  it("should support synchronous tree data", async () => {
    const treeData = [
      { id: "1", name: "Parent", children: [{ id: "1-1", name: "Child" }] },
    ]

    const { result } = renderHook(
      () =>
        useDataTable({
          columns,
          dataSource: local({ rows: treeData }),
          state: stateInternal({ initial: {} }),
          features: {
            tree: {
              getSubRows: (row) => row.children,
              defaultExpandedDepth: 1,
            },
          },
          getRowId: (row) => row.id,
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.status.type).toBe("ready"))

    expect(result.current.tree.enabled).toBe(true)
    expect(result.current.tree.expandedRowIds).toContain("1") // 默认展开第一层
  })

  it("should support lazy loading children", async () => {
    const loadChildren = vi.fn().mockResolvedValue([
      { id: "1-1", name: "Child 1" },
      { id: "1-2", name: "Child 2" },
    ])

    const { result } = renderHook(
      () =>
        useDataTable({
          columns,
          dataSource: local({ rows: [{ id: "1", name: "Parent", hasChildren: true }] }),
          state: stateInternal({ initial: {} }),
          features: {
            tree: {
              getRowCanExpand: (row) => row.hasChildren,
              loadChildren,
            },
          },
          getRowId: (row) => row.id,
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.status.type).toBe("ready"))

    act(() => result.current.actions.expandRow("1"))

    expect(result.current.tree.loadingRowIds).toContain("1")

    await waitFor(() => {
      expect(loadChildren).toHaveBeenCalledWith(expect.objectContaining({ id: "1" }))
      expect(result.current.tree.loadingRowIds).not.toContain("1")
      expect(result.current.tree.expandedRowIds).toContain("1")
    })
  })

  it("should handle expandToDepth", async () => {
    const treeData = [
      {
        id: "1",
        name: "L1",
        children: [
          {
            id: "1-1",
            name: "L2",
            children: [{ id: "1-1-1", name: "L3" }],
          },
        ],
      },
    ]

    const { result } = renderHook(
      () =>
        useDataTable({
          columns,
          dataSource: local({ rows: treeData }),
          state: stateInternal({ initial: {} }),
          features: {
            tree: {
              getSubRows: (row) => row.children,
            },
          },
          getRowId: (row) => row.id,
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.status.type).toBe("ready"))

    act(() => result.current.actions.expandToDepth(2))

    expect(result.current.tree.expandedRowIds).toEqual(["1", "1-1"])
  })
})
```

### 5.5 Tree Feature

```ts
describe("Tree Feature", () => {
  it("should support synchronous tree data", async () => {
    const treeData = [
      { id: "1", name: "Parent", children: [{ id: "1-1", name: "Child" }] },
    ]

    const { result } = renderHook(
      () =>
        useDataTable({
          columns,
          dataSource: local({ rows: treeData }),
          state: stateInternal({ initial: {} }),
          features: {
            tree: {
              getSubRows: (row) => row.children,
              defaultExpandedDepth: 1,
            },
          },
          getRowId: (row) => row.id,
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.status.type).toBe("ready"))

    expect(result.current.tree.enabled).toBe(true)
    expect(result.current.tree.expandedRowIds).toContain("1") // 默认展开第一层
  })

  it("should support lazy loading children", async () => {
    const loadChildren = vi.fn().mockResolvedValue([
      { id: "1-1", name: "Child 1" },
      { id: "1-2", name: "Child 2" },
    ])

    const { result } = renderHook(
      () =>
        useDataTable({
          columns,
          dataSource: local({ rows: [{ id: "1", name: "Parent", hasChildren: true }] }),
          state: stateInternal({ initial: {} }),
          features: {
            tree: {
              getRowCanExpand: (row) => row.hasChildren,
              loadChildren,
            },
          },
          getRowId: (row) => row.id,
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.status.type).toBe("ready"))

    act(() => result.current.actions.expandRow("1"))

    expect(result.current.tree.loadingRowIds).toContain("1")

    await waitFor(() => {
      expect(loadChildren).toHaveBeenCalledWith(expect.objectContaining({ id: "1" }))
      expect(result.current.tree.loadingRowIds).not.toContain("1")
      expect(result.current.tree.expandedRowIds).toContain("1")
    })
  })

  it("should handle expandToDepth", async () => {
    const treeData = [
      {
        id: "1",
        name: "L1",
        children: [
          {
            id: "1-1",
            name: "L2",
            children: [{ id: "1-1-1", name: "L3" }],
          },
        ],
      },
    ]

    const { result } = renderHook(
      () =>
        useDataTable({
          columns,
          dataSource: local({ rows: treeData }),
          state: stateInternal({ initial: {} }),
          features: {
            tree: {
              getSubRows: (row) => row.children,
            },
          },
          getRowId: (row) => row.id,
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.status.type).toBe("ready"))

    act(() => result.current.actions.expandToDepth(2))

    expect(result.current.tree.expandedRowIds).toEqual(["1", "1-1"])
  })

  it("should handle tree + selection combination", async () => {
    const treeData = [
      {
        id: "1",
        name: "Parent",
        children: [
          { id: "1-1", name: "Child 1" },
          { id: "1-2", name: "Child 2" },
        ],
      },
    ]

    const { result } = renderHook(
      () =>
        useDataTable({
          columns,
          dataSource: local({ rows: treeData }),
          state: stateInternal({ initial: {} }),
          features: {
            tree: {
              getSubRows: (row) => row.children,
              defaultExpandedDepth: Infinity,
            },
            selection: {
              mode: "page",
              // 可选：级联选择行为
              // selectionBehavior: "cascade"
            },
          },
          getRowId: (row) => row.id,
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.status.type).toBe("ready"))

    // 选择父节点
    act(() => result.current.table.getRow("1").toggleSelected())

    // 根据 selectionBehavior 验证子节点是否被选中
    // 如果是 "cascade"，子节点应该自动选中
    // 如果是 "independent"（默认），子节点不受影响
  })
})
```

### 5.6 Drag Sort Feature

```ts
describe("Drag Sort Feature", () => {
  it("should reorder rows in local data source", async () => {
    const tasks = [
      { id: "1", name: "Task 1" },
      { id: "2", name: "Task 2" },
      { id: "3", name: "Task 3" },
    ]

    const onReorder = vi.fn()

    const { result } = renderHook(
      () =>
        useDataTable({
          columns,
          dataSource: local({ rows: tasks }),
          state: stateInternal({ initial: {} }),
          features: {
            dragSort: { onReorder },
          },
          getRowId: (row) => row.id,
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.status.type).toBe("ready"))

    act(() => result.current.actions.moveRow("1", "3"))

    expect(onReorder).toHaveBeenCalledWith(
      expect.objectContaining({
        activeId: "1",
        overId: "3",
        activeIndex: 0,
        overIndex: 2,
        reorderedRows: [
          { id: "2", name: "Task 2" },
          { id: "3", name: "Task 3" },
          { id: "1", name: "Task 1" },
        ],
      })
    )
  })

  it("should respect canDrag and canDrop constraints", async () => {
    const onReorder = vi.fn()

    const { result } = renderHook(
      () =>
        useDataTable({
          columns,
          dataSource: local({ rows: mockTasks }),
          state: stateInternal({ initial: {} }),
          features: {
            dragSort: {
              onReorder,
              canDrag: (row) => !row.locked,
              canDrop: (active, over) => active.priority === over.priority,
            },
          },
          getRowId: (row) => row.id,
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.status.type).toBe("ready"))

    // 尝试拖拽锁定的行
    act(() => result.current.actions.moveRow("locked-task", "task-2"))
    expect(onReorder).not.toHaveBeenCalled()
  })
})
```

---

## 6. 状态机测试

### 6.1 Status 流转测试

```ts
describe("Status State Machine", () => {
  it("should transition: InitialLoading -> Ready", async () => {
    const { result } = renderHook(
      () =>
        useDataTable({
          columns,
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

  it("should transition: InitialLoading -> Empty", async () => {
    const { result } = renderHook(
      () =>
        useDataTable({
          columns,
          dataSource: createMockDataSource([]), // 空数据
          state: createMockStateAdapter(defaultState),
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => {
      expect(result.current.status.type).toBe("empty")
    })
  })

  it("should transition: InitialLoading -> Error", async () => {
    const { result } = renderHook(
      () =>
        useDataTable({
          columns,
          dataSource: createMockDataSource([], {
            errorOnQuery: () => new Error("Network error"),
          }),
          state: createMockStateAdapter(defaultState),
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => {
      expect(result.current.status.type).toBe("error")
      expect(result.current.errors?.blocking).toBeDefined()
    })
  })

  it("should preserve data on refresh error (Ready -> Ready with nonBlocking error)", async () => {
    let shouldError = false

    const { result } = renderHook(
      () =>
        useDataTable({
          columns,
          dataSource: createMockDataSource(mockUsers, {
            errorOnQuery: () => (shouldError ? new Error("Refresh failed") : null),
          }),
          state: createMockStateAdapter(defaultState),
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.status.type).toBe("ready"))

    shouldError = true
    act(() => result.current.actions.refetch())

    await waitFor(() => {
      expect(result.current.status.type).toBe("ready") // 保持 ready
      expect(result.current.errors?.nonBlocking).toBeDefined()
      expect(result.current.table.getRowModel().rows.length).toBeGreaterThan(0) // 保留旧数据
    })
  })
})
```

### 6.2 Activity 状态测试

```ts
describe("Activity States", () => {
  it("should set isFetching during background refresh", async () => {
    const { result } = renderHook(
      () =>
        useDataTable({
          columns,
          dataSource: createMockDataSource(mockUsers, { delay: 500 }),
          state: createMockStateAdapter(defaultState),
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.status.type).toBe("ready"))

    act(() => result.current.actions.setPage(2))

    expect(result.current.activity.isFetching).toBe(true)

    await waitFor(() => {
      expect(result.current.activity.isFetching).toBe(false)
    })
  })

  it("should set preferencesReady after async hydration", async () => {
    const mockStorage = createMockStorage<Record<string, boolean>>(
      { "users.columns": { email: false } },
      { delay: 300 } // 模拟异步加载
    )

    const { result } = renderHook(
      () =>
        useDataTable({
          columns,
          dataSource: createMockDataSource(mockUsers),
          state: createMockStateAdapter(defaultState),
          features: {
            columnVisibility: {
              storageKey: "users.columns",
              storage: mockStorage,
            },
          },
        }),
      { wrapper: createTestWrapper() }
    )

    expect(result.current.activity.preferencesReady).toBe(false)

    await waitFor(() => {
      expect(result.current.activity.preferencesReady).toBe(true)
    })
  })
})
```

---

## 7. Filters 测试

### 7.1 强类型筛选测试

```ts
describe("TableFilters", () => {
  it("should maintain type safety", async () => {
    interface UserFilters {
      status: "active" | "inactive"
      role: string[]
      createdAfter: Date | null
    }

    const { result } = renderHook(
      () =>
        useDataTable<User, UserFilters>({
          columns,
          dataSource: createMockDataSource(mockUsers),
          state: stateInternal({
            initial: {
              filters: {
                status: "active",
                role: [],
                createdAfter: null,
              },
            },
          }),
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.status.type).toBe("ready"))

    // 类型安全的 set
    act(() => result.current.filters.set("status", "inactive"))
    expect(result.current.filters.state.status).toBe("inactive")

    // 批量更新
    act(() =>
      result.current.filters.setBatch({
        status: "active",
        role: ["admin"],
      })
    )

    expect(result.current.filters.state).toEqual({
      status: "active",
      role: ["admin"],
      createdAfter: null,
    })
  })

  it("should reset filters", async () => {
    const { result } = renderHook(
      () =>
        useDataTable({
          columns,
          dataSource: createMockDataSource(mockUsers),
          state: stateInternal({
            initial: { filters: { status: "active" } },
          }),
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.status.type).toBe("ready"))

    act(() => result.current.filters.set("status", "inactive"))
    act(() => result.current.filters.reset())

    expect(result.current.filters.state.status).toBe("active") // 恢复初始值
  })
})
```

---

## 8. E2E 测试补充

### 8.1 树形数据交互

```ts
test("tree expand and collapse", async ({ page }) => {
  await page.goto("/departments")

  // 展开第一层
  await page.getByRole("button", { name: "展开" }).first().click()
  await expect(page.getByText("Engineering")).toBeVisible()

  // 展开第二层
  await page.getByRole("button", { name: "展开" }).nth(1).click()
  await expect(page.getByText("Frontend Team")).toBeVisible()

  // 折叠第一层
  await page.getByRole("button", { name: "折叠" }).first().click()
  await expect(page.getByText("Engineering")).toBeHidden()
})
```

### 8.2 拖拽排序交互

```ts
test("drag and drop reorder", async ({ page }) => {
  await page.goto("/tasks")

  const firstTask = page.getByRole("row").nth(1)
  const thirdTask = page.getByRole("row").nth(3)

  await firstTask.dragTo(thirdTask)

  // 验证顺序变化
  await expect(page.getByRole("row").nth(1)).toContainText("Task 2")
  await expect(page.getByRole("row").nth(2)).toContainText("Task 3")
  await expect(page.getByRole("row").nth(3)).toContainText("Task 1")
})
```

### 8.3 跨页选择交互

```ts
test("cross-page selection", async ({ page }) => {
  await page.goto("/users")

  // 选择第一页的两行
  await page.getByRole("checkbox").nth(1).check()
  await page.getByRole("checkbox").nth(2).check()

  await expect(page.getByText("已选择 2 条")).toBeVisible()

  // 翻页
  await page.getByRole("button", { name: "下一页" }).click()

  // 验证选择保留
  await expect(page.getByText("已选择 2 条")).toBeVisible()

  // 全选当前页
  await page.getByRole("button", { name: "全选当前页" }).click()
  await expect(page.getByText("已选择 12 条")).toBeVisible()

  // 升级为全选所有
  await page.getByRole("button", { name: "选择全部 50 条" }).click()
  await expect(page.getByText("已选择全部 50 条")).toBeVisible()
})
```

### 8.4 筛选器交互

```ts
test("filter bar interaction", async ({ page }) => {
  await page.goto("/users")

  // 打开筛选器
  await page.getByRole("button", { name: "筛选" }).click()

  // 选择状态筛选
  await page.getByLabel("状态").selectOption("inactive")

  // 选择日期范围
  await page.getByLabel("创建时间").click()
  await page.getByRole("button", { name: "最近 7 天" }).click()

  // 验证 URL 同步
  expect(page.url()).toContain("status=inactive")
  expect(page.url()).toContain("createdAfter=")

  // 验证已激活筛选标签
  await expect(page.getByRole("button", { name: "状态: 已停用" })).toBeVisible()
  await expect(page.getByRole("button", { name: "创建时间: 最近 7 天" })).toBeVisible()

  // 移除单个筛选
  await page.getByRole("button", { name: "状态: 已停用" }).getByRole("button", { name: "×" }).click()
  expect(page.url()).not.toContain("status=")

  // 清除全部筛选
  await page.getByRole("button", { name: "清除全部" }).click()
  expect(page.url()).not.toContain("createdAfter=")
})
```

---

## 9. 性能测试

### 9.1 引用稳定性测试

```ts
describe("Reference Stability", () => {
  it("should keep actions reference stable", async () => {
    const { result, rerender } = renderHook(
      () =>
        useDataTable({
          columns,
          dataSource: createMockDataSource(mockUsers),
          state: createMockStateAdapter(defaultState),
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.status.type).toBe("ready"))

    const firstActions = result.current.actions

    act(() => result.current.actions.setPage(2))
    rerender()

    expect(result.current.actions).toBe(firstActions) // 引用稳定
  })

  it("should keep filters reference stable", async () => {
    const { result, rerender } = renderHook(
      () =>
        useDataTable({
          columns,
          dataSource: createMockDataSource(mockUsers),
          state: createMockStateAdapter(defaultState),
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.status.type).toBe("ready"))

    const firstFilters = result.current.filters

    act(() => result.current.filters.set("status", "inactive"))
    rerender()

    expect(result.current.filters).toBe(firstFilters) // 引用稳定
  })
})
```

### 9.2 渲染次数测试

```ts
describe("Render Performance", () => {
  it("should not cause unnecessary rerenders", async () => {
    const renderSpy = vi.fn()

    function TestComponent() {
      const dt = useDataTable({
        columns,
        dataSource: createMockDataSource(mockUsers),
        state: createMockStateAdapter(defaultState),
      })

      renderSpy()

      return <div>{dt.table.getRowModel().rows.length}</div>
    }

    const { rerender } = render(<TestComponent />, { wrapper: createTestWrapper() })

    await waitFor(() => expect(renderSpy).toHaveBeenCalledTimes(2)) // mount + data loaded

    rerender(<TestComponent />)

    expect(renderSpy).toHaveBeenCalledTimes(2) // 无额外渲染
  })
})
```

---

## 10. 可测试性设计清单

- [ ] 所有 Hook 支持依赖注入（可传入 mock adapter/source）
- [ ] 所有异步操作返回 Promise（便于 await）
- [ ] 所有 DOM 元素有稳定的 `data-testid` 或语义化选择器
- [ ] 提供 `createMockStateAdapter` 和 `createMockDataSource` 测试工具
- [ ] 错误边界覆盖，避免测试时组件静默失败
- [ ] 所有 Feature 的 `enabled` 字段可独立测试
- [ ] 状态机流转路径完整覆盖
- [ ] 引用稳定性保证（actions/filters 不因状态变化而重建）
- [ ] 偏好持久化提供 mock storage 接口
- [ ] 树形数据支持同步/异步两种模式的独立测试
- [ ] 拖拽排序提供编程式 API（`moveRow`）便于测试
- [ ] 跨页选择的 include/exclude 模式可独立验证
- [ ] 筛选器类型安全性通过 TypeScript 编译时检查
- [ ] URL 序列化/反序列化逻辑可独立测试（不依赖 Router）
- [ ] 错误恢复流程（blocking/nonBlocking）有明确测试用例

---

## 11. 测试覆盖率目标

### 11.1 代码覆盖率

| 模块 | 行覆盖率 | 分支覆盖率 | 函数覆盖率 |
|------|---------|-----------|-----------|
| State Adapters | ≥ 90% | ≥ 85% | 100% |
| Data Sources | ≥ 90% | ≥ 85% | 100% |
| Features | ≥ 85% | ≥ 80% | 100% |
| useDataTable Hook | ≥ 90% | ≥ 85% | 100% |
| UI Components | ≥ 80% | ≥ 75% | ≥ 90% |

### 11.2 关键路径覆盖

必须覆盖的关键路径：

- [ ] 首次加载成功/失败/空数据
- [ ] 翻页、排序、筛选触发的数据刷新
- [ ] 刷新失败时的错误处理（blocking/nonBlocking）
- [ ] 偏好持久化的读取/写入/合并
- [ ] 跨页选择的状态保持与清空
- [ ] 树形数据的展开/折叠/懒加载
- [ ] 拖拽排序的乐观更新与回滚
- [ ] URL 状态的序列化/反序列化
- [ ] Feature 的启用/禁用切换

### 11.3 边界条件测试

| 场景 | 测试用例 |
|------|---------|
| 空数据 | 首次加载返回空数组 |
| 单页数据 | total < pageSize，分页器应禁用 |
| 大数据量 | 1000+ 行的渲染性能 |
| 网络超时 | queryFn 超时后的错误处理 |
| 并发请求 | 快速切换筛选时的请求取消 |
| 存储失败 | localStorage 满时的降级处理 |
| 列定义变更 | 偏好合并时的非法值清理 |
| 深层树形 | 10+ 层级的展开性能 |
| 跨页全选 | 选择 10000+ 条数据的内存占用 |

### 11.4 可访问性测试

使用 `@testing-library/jest-dom` 和 `axe-core`：

```ts
import { axe, toHaveNoViolations } from "jest-axe"

expect.extend(toHaveNoViolations)

describe("Accessibility", () => {
  it("should have no a11y violations", async () => {
    const { container } = render(
      <DataTablePreset dt={dt} />,
      { wrapper: createTestWrapper() }
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it("should support keyboard navigation", async () => {
    const { getByRole } = render(
      <DataTablePreset dt={dt} />,
      { wrapper: createTestWrapper() }
    )

    const firstRow = getByRole("row", { name: /user 1/i })
    firstRow.focus()

    // Tab 到下一行
    userEvent.tab()
    expect(getByRole("row", { name: /user 2/i })).toHaveFocus()

    // Enter 选择行
    userEvent.keyboard("{Enter}")
    expect(dt.selection.selectedRowIds).toContain("user-2")
  })
})
```

---

## 12. CI/CD 集成

### 12.1 测试流水线

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test:unit --coverage

      - name: Run integration tests
        run: pnpm test:integration

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright
        run: pnpm exec playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### 12.2 性能基准测试

```ts
// benchmark/table-performance.bench.ts
import { bench, describe } from "vitest"

describe("Table Performance", () => {
  bench("render 1000 rows", async () => {
    const { result } = renderHook(
      () =>
        useDataTable({
          columns,
          dataSource: createMockDataSource(generate1000Users()),
          state: createMockStateAdapter(defaultState),
        }),
      { wrapper: createTestWrapper() }
    )

    await waitFor(() => expect(result.current.status.type).toBe("ready"))
  })

  bench("sort 1000 rows", async () => {
    const dt = setupTable(generate1000Users())
    dt.actions.setSort([{ field: "name", order: "asc" }])
  })

  bench("filter 1000 rows", async () => {
    const dt = setupTable(generate1000Users())
    dt.filters.set("status", "active")
  })
})
```

---

## 13. 测试最佳实践

### 13.1 测试命名规范

```ts
// ✅ 好的命名
it("should reset page to 1 when filter changes")
it("should preserve selection when mode is cross-page")
it("should merge stored preferences with current columns")

// ❌ 不好的命名
it("test filter")
it("works correctly")
it("should do something")
```

### 13.2 测试组织

```ts
// 按功能分组
describe("Selection Feature", () => {
  describe("page mode", () => {
    it("should clear selection on page change")
    it("should select all current page")
  })

  describe("cross-page mode", () => {
    it("should preserve selection on page change")
    it("should select all matching rows")
  })
})
```

### 13.3 避免测试实现细节

```ts
// ❌ 测试实现细节
it("should call useState with initial value", () => {
  const spy = vi.spyOn(React, "useState")
  renderHook(() => useDataTable({ ... }))
  expect(spy).toHaveBeenCalledWith(expect.any(Object))
})

// ✅ 测试行为
it("should initialize with default page 1", () => {
  const { result } = renderHook(() => useDataTable({ ... }))
  expect(result.current.pagination.page).toBe(1)
})
```

### 13.4 使用 data-testid 的时机

```tsx
// ✅ 优先使用语义化选择器
getByRole("button", { name: "下一页" })
getByLabelText("搜索")
getByText("已选择 5 条")

// ✅ 动态内容使用 data-testid
<div data-testid={`row-${row.id}`}>

// ❌ 过度使用 data-testid
<button data-testid="next-button">下一页</button>
```

---

## 14. 测试工具推荐

| 工具 | 用途 | 推荐理由 |
|------|------|---------|
| Vitest | 单元/集成测试 | 快速、与 Vite 集成、支持 ESM |
| @testing-library/react | React 组件测试 | 鼓励测试用户行为而非实现 |
| @testing-library/user-event | 用户交互模拟 | 更真实的事件模拟 |
| Playwright | E2E 测试 | 跨浏览器、稳定、调试友好 |
| MSW | API Mock | 拦截网络请求，不侵入代码 |
| jest-axe | 可访问性测试 | 自动检测 a11y 问题 |
| @tanstack/react-query-devtools | Query 调试 | 可视化 Query 状态 |

---

## 15. 故障排查指南

### 15.1 常见测试失败原因

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| `act()` warning | 状态更新未包裹在 `act()` 中 | 使用 `await waitFor()` 或 `act()` |
| 测试超时 | 异步操作未完成 | 增加 timeout 或检查 mock 是否正确 |
| 引用不稳定 | 对象/函数每次渲染都重建 | 使用 `useMemo`/`useCallback` |
| Query 缓存污染 | 测试间共享 QueryClient | 每个测试创建新的 QueryClient |
| Mock 未清理 | 上一个测试的 mock 影响当前测试 | 使用 `afterEach(() => vi.clearAllMocks())` |

### 15.2 调试技巧

```ts
// 打印当前状态
screen.debug()

// 打印特定元素
screen.debug(screen.getByRole("table"))

// 查看 Query 状态
import { queryClient } from "./test-utils"
console.log(queryClient.getQueryData(["users"]))

// 暂停测试
await screen.findByText("Loading...")
debugger
```
