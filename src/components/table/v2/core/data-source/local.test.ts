import { describe, expect, it } from "vitest"
import { local } from "./local"

describe("local dataSource", () => {
  it("支持过滤、排序与分页", () => {
    const ds = local<
      { id: number; status: string; age: number },
      { status?: string; age?: number }
    >({
      rows: [
        { id: 1, status: "active", age: 20 },
        { id: 2, status: "disabled", age: 30 },
        { id: 3, status: "active", age: 10 },
      ],
    })

    const state = ds.use({
      page: 1,
      size: 2,
      sort: [{ field: "age", order: "asc" }],
      filters: { status: "active" },
    })

    expect(state.data?.rows.map((row) => row.id)).toEqual([3, 1])
    expect(state.data?.pageCount).toBe(1)
    expect(state.data?.total).toBe(2)
  })

  it("数组过滤值会用 includes 匹配", () => {
    const ds = local<{ id: number; status: string }, { status?: string[] }>({
      rows: [
        { id: 1, status: "active" },
        { id: 2, status: "disabled" },
        { id: 3, status: "pending" },
      ],
    })

    const state = ds.use({
      page: 1,
      size: 10,
      sort: [],
      filters: { status: ["active", "pending"] },
    })

    expect(state.data?.rows.map((row) => row.id)).toEqual([1, 3])
  })

  it("支持 total 覆盖", () => {
    const ds = local<{ id: number }, Record<string, never>>({
      rows: [{ id: 1 }, { id: 2 }],
      total: 100,
    })

    const state = ds.use({
      page: 1,
      size: 10,
      sort: [],
      filters: {},
    })

    expect(state.data?.total).toBe(100)
    expect(state.data?.pageCount).toBe(10)
  })
})
