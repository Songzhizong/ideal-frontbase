import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { createNoopActions } from "../__tests__/test-utils"
import { useColumnVisibilityFeature } from "./column-visibility"

describe("columnVisibility feature", () => {
  const storageKey = "dt_test_column_visibility"

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

  it("会合并 stored 与 defaults，并丢弃不存在的列", () => {
    const { map, storage } = createMemoryStorage<{
      schemaVersion: number
      updatedAt: number
      value: Record<string, boolean>
    }>()
    map.set(storageKey, {
      schemaVersion: 1,
      updatedAt: 123,
      value: { a: false, c: false },
    })

    const { result } = renderHook(() =>
      useColumnVisibilityFeature({
        feature: { storageKey, storage },
        columnIds: ["a", "b"],
      }),
    )

    const patch = result.current.runtime.patchTableOptions?.({})
    expect(patch?.state?.columnVisibility).toEqual({ a: false, b: true })
  })

  it("resetColumnVisibility 会移除存储并恢复 defaults", async () => {
    const { map, storage } = createMemoryStorage<{
      schemaVersion: number
      updatedAt: number
      value: Record<string, boolean>
    }>()
    map.set(storageKey, {
      schemaVersion: 1,
      updatedAt: 123,
      value: { a: false },
    })

    const { result } = renderHook(() =>
      useColumnVisibilityFeature({
        feature: { storageKey, storage },
        columnIds: ["a", "b"],
      }),
    )

    const patched = result.current.runtime.patchActions?.(createNoopActions())
    act(() => {
      patched?.resetColumnVisibility?.()
    })

    await waitFor(() => {
      const patch = result.current.runtime.patchTableOptions?.({})
      expect(patch?.state?.columnVisibility).toEqual({ a: true, b: true })
      expect(map.has(storageKey)).toBe(false)
    })
  })

  it("storageKey 为空时会降级为非持久模式", async () => {
    const { map, storage } = createMemoryStorage<{
      schemaVersion: number
      updatedAt: number
      value: Record<string, boolean>
    }>()

    const { result } = renderHook(() =>
      useColumnVisibilityFeature({
        feature: {
          storageKey: "",
          storage,
          defaultVisible: { a: false },
        },
        columnIds: ["a", "b"],
      }),
    )

    const patch = result.current.runtime.patchTableOptions?.({})
    expect(patch?.state?.columnVisibility).toEqual({ a: false, b: true })

    act(() => {
      patch?.onColumnVisibilityChange?.({ a: true, b: false })
    })

    await waitFor(() => {
      expect(map.size).toBe(0)
    })
  })
})
