import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { TableStateSnapshot } from "../types"
import { stateInternal } from "./internal"

describe("stateInternal", () => {
  it("会用默认值构建初始 snapshot", () => {
    type Filters = { q: string | null }
    const { result } = renderHook(() =>
      stateInternal<Filters>({
        initial: { filters: { q: null } },
      }),
    )

    expect(result.current.getSnapshot()).toEqual({
      page: 1,
      size: 10,
      sort: [],
      filters: { q: null },
    })
  })

  it("setSnapshot 会更新并通知订阅者", () => {
    type Filters = { q: string | null }
    const { result } = renderHook(() =>
      stateInternal<Filters>({
        initial: { page: 2, size: 10, sort: [], filters: { q: null } },
      }),
    )

    const listenerCalls: number[] = []
    const unsubscribe = result.current.subscribe(() => listenerCalls.push(Date.now()))

    act(() => {
      result.current.setSnapshot(
        {
          page: 3,
          size: 10,
          sort: [],
          filters: { q: null },
        },
        "page",
      )
    })

    expect(result.current.getSnapshot().page).toBe(3)
    expect(listenerCalls.length).toBe(1)
    unsubscribe()
  })

  it("filters 变更时默认重置 page=1", () => {
    type Filters = { q: string | null }
    const initial: TableStateSnapshot<Filters> = {
      page: 5,
      size: 10,
      sort: [],
      filters: { q: null },
    }
    const { result } = renderHook(() =>
      stateInternal<Filters>({
        initial,
      }),
    )

    act(() => {
      result.current.setSnapshot(
        {
          ...initial,
          page: 9,
          filters: { q: "hello" },
        },
        "filters",
      )
    })

    expect(result.current.getSnapshot().page).toBe(1)
  })

  it("resetPageOnFilterChange=false 时不重置 page", () => {
    type Filters = { q: string | null }
    const initial: TableStateSnapshot<Filters> = {
      page: 5,
      size: 10,
      sort: [],
      filters: { q: null },
    }
    const { result } = renderHook(() =>
      stateInternal<Filters>({
        initial,
        behavior: { resetPageOnFilterChange: false },
      }),
    )

    act(() => {
      result.current.setSnapshot(
        {
          ...initial,
          page: 9,
          filters: { q: "hello" },
        },
        "filters",
      )
    })

    expect(result.current.getSnapshot().page).toBe(9)
  })

  it("支持通过 options.searchKey 暴露搜索字段", () => {
    type Filters = { keyword: string }
    const { result } = renderHook(() =>
      stateInternal<Filters>({
        initial: {
          filters: { keyword: "" },
        },
        searchKey: "keyword",
      }),
    )

    expect(result.current.searchKey).toBe("keyword")
  })
})
