import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { FilterDefinition } from "../../core"
import { useAdvancedSearchState } from "./use-advanced-search-state"

type DemoFilters = {
  q: string | null
  status: "active" | "disabled" | null
}

const advancedFields: Array<FilterDefinition<DemoFilters, keyof DemoFilters>> = [
  {
    key: "status",
    label: "状态",
    type: "select",
    options: [
      { label: "启用", value: "active" },
      { label: "禁用", value: "disabled" },
    ],
  },
]

function createSetFilterSpy() {
  const spy = vi.fn<(key: keyof DemoFilters, value: DemoFilters[keyof DemoFilters]) => void>()
  const setFilter = ((key, value) => {
    spy(key, value)
  }) as <K extends keyof DemoFilters>(key: K, value: DemoFilters[K]) => void
  return { spy, setFilter }
}

describe("useAdvancedSearchState", () => {
  it("会从 filterKey 当前值初始化输入框", () => {
    const { setFilter } = createSetFilterSpy()
    const { result } = renderHook(() =>
      useAdvancedSearchState<DemoFilters>({
        filterKey: "q",
        booleanLabels: { trueText: "是", falseText: "否" },
        advancedFields,
        filtersState: {
          q: "alice",
          status: null,
        },
        setFilter,
        requestInputFocus: () => {},
        placeholderTexts: {
          defaultText: "输入关键字后按回车添加",
          textField: (label) => `输入${label}`,
          optionField: (label) => `选择${label}`,
        },
      }),
    )

    expect(result.current.advancedDisplayValue).toBe("alice")
  })

  it("外部 filter 变化后会同步输入值", async () => {
    const { setFilter } = createSetFilterSpy()
    const { result, rerender } = renderHook(
      ({ filtersState }: { filtersState: DemoFilters }) =>
        useAdvancedSearchState<DemoFilters>({
          filterKey: "q",
          booleanLabels: { trueText: "是", falseText: "否" },
          advancedFields,
          filtersState,
          setFilter,
          requestInputFocus: () => {},
          placeholderTexts: {
            defaultText: "输入关键字后按回车添加",
            textField: (label) => `输入${label}`,
            optionField: (label) => `选择${label}`,
          },
        }),
      {
        initialProps: {
          filtersState: {
            q: "alice",
            status: null,
          },
        },
      },
    )

    expect(result.current.advancedDisplayValue).toBe("alice")

    rerender({
      filtersState: {
        q: "bob",
        status: null,
      },
    })

    await waitFor(() => {
      expect(result.current.advancedDisplayValue).toBe("bob")
    })
  })

  it("onClear 会同步清空真实 filter 值", () => {
    const { spy, setFilter } = createSetFilterSpy()
    const { result } = renderHook(() =>
      useAdvancedSearchState<DemoFilters>({
        filterKey: "q",
        booleanLabels: { trueText: "是", falseText: "否" },
        advancedFields,
        filtersState: {
          q: "alice",
          status: null,
        },
        setFilter,
        requestInputFocus: () => {},
        placeholderTexts: {
          defaultText: "输入关键字后按回车添加",
          textField: (label) => `输入${label}`,
          optionField: (label) => `选择${label}`,
        },
      }),
    )

    act(() => {
      result.current.onClear()
    })

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith("q", "")
    expect(result.current.advancedDisplayValue).toBe("")
  })
})
