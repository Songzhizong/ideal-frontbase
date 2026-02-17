import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { createNoopActions } from "../__tests__/test-utils"
import { useColumnSizingFeature } from "./column-sizing"

describe("columnSizing feature", () => {
  const storageKey = "dt_test_column_sizing"

  function createMemoryStorage<T>() {
    const map = new Map<string, T>()
    return {
      map,
      storage: {
        getSync: (key: string) => map.get(key) ?? null,
        get: async (key: string) => map.get(key) ?? null,
        set: async (key: string, value: T) => {
          map.set(key, value)
        },
        remove: async (key: string) => {
          map.delete(key)
        },
      },
    }
  }

  it("会按 min/max 约束修正存储值", () => {
    const { map, storage } = createMemoryStorage<{
      schemaVersion: number
      updatedAt: number
      value: Record<string, number>
    }>()
    map.set(storageKey, {
      schemaVersion: 1,
      updatedAt: 123,
      value: { a: 10 },
    })

    const { result } = renderHook(() =>
      useColumnSizingFeature({
        feature: { storageKey, storage },
        columns: [
          { id: "a", size: 100, minSize: 50, maxSize: 200 },
          { id: "b", size: 120, minSize: 80, maxSize: 160 },
        ],
      }),
    )

    const patch = result.current.runtime.patchTableOptions?.({})
    expect(patch?.state?.columnSizing).toEqual({ a: 50, b: 120 })
  })

  it("resetColumnSizing 会移除存储并恢复 defaults", async () => {
    const { map, storage } = createMemoryStorage<{
      schemaVersion: number
      updatedAt: number
      value: Record<string, number>
    }>()
    map.set(storageKey, {
      schemaVersion: 1,
      updatedAt: 123,
      value: { a: 140, b: 200 },
    })

    const { result } = renderHook(() =>
      useColumnSizingFeature({
        feature: { storageKey, storage },
        columns: [
          { id: "a", size: 100, minSize: 50, maxSize: 200 },
          { id: "b", size: 120, minSize: 80, maxSize: 160 },
        ],
      }),
    )

    const patched = result.current.runtime.patchActions?.(createNoopActions())
    act(() => {
      patched?.resetColumnSizing?.()
    })

    await waitFor(() => {
      const patch = result.current.runtime.patchTableOptions?.({})
      expect(patch?.state?.columnSizing).toEqual({ a: 100, b: 120 })
      expect(map.has(storageKey)).toBe(false)
    })
  })

  it("storageKey 为空时会降级为非持久模式", async () => {
    const { map, storage } = createMemoryStorage<{
      schemaVersion: number
      updatedAt: number
      value: Record<string, number>
    }>()

    const { result } = renderHook(() =>
      useColumnSizingFeature({
        feature: { storageKey: "", storage, defaultSizing: { a: 180 } },
        columns: [
          { id: "a", size: 100, minSize: 50, maxSize: 200 },
          { id: "b", size: 120, minSize: 80, maxSize: 160 },
        ],
      }),
    )

    const patch = result.current.runtime.patchTableOptions?.({})
    expect(patch?.state?.columnSizing).toEqual({ a: 180, b: 120 })

    act(() => {
      patch?.onColumnSizingChange?.({ a: 150, b: 140 })
    })

    await waitFor(() => {
      expect(map.size).toBe(0)
    })
  })
})
