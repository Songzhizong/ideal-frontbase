import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { TableStateSnapshot } from "../types"
import { stateControlled } from "./controlled"

describe("stateControlled", () => {
  it("filters 变更时默认重置 page=1", () => {
    type Filters = { q: string | null }
    const initial: TableStateSnapshot<Filters> = {
      page: 3,
      size: 10,
      sort: [],
      filters: { q: null },
    }
    const onChange = vi.fn()

    const { result } = renderHook(() =>
      stateControlled({
        value: initial,
        onChange,
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

    expect(onChange).toHaveBeenCalledWith({
      ...initial,
      page: 1,
      filters: { q: "hello" },
    })
  })

  it("resetPageOnFilterChange=false 时不重置 page", () => {
    type Filters = { q: string | null }
    const initial: TableStateSnapshot<Filters> = {
      page: 3,
      size: 10,
      sort: [],
      filters: { q: null },
    }
    const onChange = vi.fn()

    const { result } = renderHook(() =>
      stateControlled({
        value: initial,
        onChange,
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

    expect(onChange).toHaveBeenCalledWith({
      ...initial,
      page: 9,
      filters: { q: "hello" },
    })
  })

  it("subscribe 在 value 更新时通知", () => {
    type Filters = { q: string | null }
    const onChange = vi.fn()
    const initial: TableStateSnapshot<Filters> = {
      page: 1,
      size: 10,
      sort: [],
      filters: { q: null },
    }

    const { result, rerender } = renderHook(
      ({ value }: { value: TableStateSnapshot<Filters> }) =>
        stateControlled({
          value,
          onChange,
        }),
      {
        initialProps: { value: initial },
      },
    )

    const listener = vi.fn()
    let unsubscribe: (() => void) | null = null
    act(() => {
      unsubscribe = result.current.subscribe(listener)
    })

    rerender({
      value: {
        ...initial,
        page: 2,
      },
    })

    expect(listener).toHaveBeenCalledTimes(1)

    act(() => {
      unsubscribe?.()
    })

    rerender({
      value: {
        ...initial,
        page: 3,
      },
    })

    expect(listener).toHaveBeenCalledTimes(1)
  })

  it("支持通过 options.searchKey 暴露搜索字段", () => {
    type Filters = { keyword: string }
    const onChange = vi.fn()
    const initial: TableStateSnapshot<Filters> = {
      page: 1,
      size: 10,
      sort: [],
      filters: { keyword: "" },
    }

    const { result } = renderHook(() =>
      stateControlled({
        value: initial,
        onChange,
        searchKey: "keyword",
      }),
    )

    expect(result.current.searchKey).toBe("keyword")
  })
})
