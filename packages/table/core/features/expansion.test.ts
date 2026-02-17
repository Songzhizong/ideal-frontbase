import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { createNoopActions } from "../__tests__/test-utils"
import { useExpansionFeature } from "./expansion"

describe("expansion feature", () => {
  it("expandToDepth 在非树形扩展中：depth<=0 折叠，depth>0 视为全部展开", async () => {
    const { result } = renderHook(() =>
      useExpansionFeature<Record<string, never>, Record<string, never>>({
        feature: { enabled: true },
      }),
    )

    const actions = result.current.runtime.patchActions?.(createNoopActions())
    if (!actions) {
      throw new Error("patchActions 未返回")
    }
    if (!actions.expandToDepth) {
      throw new Error("expandToDepth 未返回")
    }
    const expandToDepth = actions.expandToDepth

    act(() => {
      expandToDepth(1)
    })

    await waitFor(() => {
      const patch = result.current.runtime.patchTableOptions?.({})
      expect(patch?.state?.expanded).toBe(true)
    })

    act(() => {
      expandToDepth(Number.POSITIVE_INFINITY)
    })

    await waitFor(() => {
      const patch = result.current.runtime.patchTableOptions?.({})
      expect(patch?.state?.expanded).toBe(true)
    })

    act(() => {
      expandToDepth(0)
    })

    await waitFor(() => {
      const patch = result.current.runtime.patchTableOptions?.({})
      expect(patch?.state?.expanded).toEqual({})
    })
  })
})
